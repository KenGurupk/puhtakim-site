// Local-only REST adapter backed by a disposable real Redis. No request-body logging.
const http = require('node:http');
const net = require('node:net');
const processes = new Map();
let nextProcess = 1;
function decode(buffer, offset = 0) {
  const end = buffer.indexOf('\r\n', offset);
  if (end < 0) return null;
  const kind = String.fromCharCode(buffer[offset]), text = buffer.subarray(offset+1,end).toString(), after = end+2;
  if (kind === '+' || kind === ':' || kind === '-') return {value:kind === ':' ? Number(text) : text, end:after, error:kind === '-'};
  if (kind === '$') {
    const size = Number(text); if (size === -1) return {value:null,end:after};
    if (buffer.length < after+size+2) return null;
    return {value:buffer.subarray(after,after+size).toString(),end:after+size+2};
  }
  if (kind === '*') {
    let position = after; const values = [];
    if (Number(text) === -1) return {value:null,end:after};
    for (let i=0;i<Number(text);i++) { const item=decode(buffer,position); if (!item) return null; values.push(item.value);position=item.end; }
    return {value:values,end:position};
  }
  throw new Error('Unsupported Redis response');
}
function redis(command) {
  return new Promise((resolve,reject)=>{
    const parts = [Buffer.from('*'+command.length+'\r\n')];
    for(const item of command){const data=Buffer.from(String(item));parts.push(Buffer.from('$'+data.length+'\r\n'),data,Buffer.from('\r\n'));}
    const socket=net.createConnection({host:'127.0.0.1',port:6379},()=>socket.write(Buffer.concat(parts)));let data=Buffer.alloc(0);
    socket.on('error',reject);
    socket.on('data',chunk=>{data=Buffer.concat([data,chunk]);const result=decode(data);if(result){socket.end();if(result.error)reject(new Error('Redis fixture command failed'));else resolve(result.value);}});
  });
}
async function jsonBody(req) {let body='';for await(const chunk of req)body+=chunk;return JSON.parse(body||'{}');}
function send(res,value,status=200){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));}
http.createServer(async(req,res)=>{
  try {
    if(req.method==='GET'&&req.url==='/ready'){await redis(['PING']);return send(res,{ready:true});}
    if(req.method==='POST'&&req.url==='/__test__/reset'){processes.clear();nextProcess=1;await redis(['FLUSHDB']);return send(res,{ok:true});}
    if(req.method==='GET'&&req.url.startsWith('/__test__/process/'))return send(res,processes.get(req.url.split('/').pop())||{});
    if(req.method==='POST'&&req.url==='/__test__/pay'){
      const body=await jsonBody(req), process=processes.get(String(body.processId));
      if(!process)return send(res,{error:'missing process'},404);
      process.transactions=[{status:'שולם',statusCode:'2',sum:String(body.amount??process.form.sum),transactionId:body.transactionId||('FIXTURE-'+body.processId),transactionToken:'fixture-transaction-token',transactionTypeId:'1',paymentType:'2',paymentsNum:'0',allPaymentsNum:'1',firstPaymentSum:'0',periodicalPaymentSum:'0',paymentDate:'07/10/26',asmachta:'FIXTURE-AUTH',description:process.form.description,fullName:process.form['pageField[fullName]'],payerPhone:process.form['pageField[phone]'],payerEmail:process.form['pageField[email]'],cardSuffix:'0000',cardType:'Local',cardTypeCode:'1',cardBrand:'Fixture',cardBrandCode:'1',cardExp:'1299'}];
      return send(res,{ok:true});
    }
    if(req.url.startsWith('/__grow/')){
      const method=req.url.split('/').pop(), form=await jsonBody(req);
      if(method==='createPaymentProcess'){
        if(form.pageCode!=='fixture-page-code'||form.userId!=='fixture-user-id')return send(res,{status:0,data:''});
        const processId=String(nextProcess++),processToken='fixture-token-'+processId;
        const process={form,processId,processToken,transactions:[],acknowledged:0};processes.set(processId,process);
        return send(res,{status:1,data:{processId,processToken,url:'https://sandboxapi.grow.link/payment/'+processId}});
      }
      const process=processes.get(String(form.processId));
      if(!process||form.processToken!==process.processToken)return send(res,{status:0,data:''});
      if(method==='getPaymentProcessInfo')return send(res,{status:1,data:{processId:process.processId,processToken:process.processToken,transactions:process.transactions}});
      if(method==='approveTransaction'){process.acknowledged++;return send(res,{status:1,data:{}});}
      return send(res,{status:0,data:''});
    }
    const command=await jsonBody(req);
    if(req.url==='/pipeline')return send(res,await Promise.all(command.map(async c=>({result:await redis(c)}))));
    return send(res,{result:await redis(command)});
  }catch{return send(res,{error:'Fixture service error'},500);}
}).listen(4012,'127.0.0.1');
