export async function json(req, res) {
    const buffers = [];

    for await (const chunk of req) {
        buffers.push(chunk)
    }

    try{
        if(buffers.length){
            req.body = JSON.parse(Buffer.concat(buffers).toString())
        } else {
            req.body = null;
        }
    } catch(err){
        req.body = null
        console.log('err', err)
    }

    res.setHeader('Content-Type', 'application/json')
}