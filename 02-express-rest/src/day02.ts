import express from 'express';
import { type Request, type Response, type NextFunction } from "express";

const app = express();


app.get('/hello', (req: Request, res: Response) => {
    console.log(req);
    setTimeout(() => {
        res.json({ message: JSON.stringify(req.query) });
    }, 3000);
});

app.post('/', (req: Request, res: Response) => {
    res.send('Got a POST request');
});


// app.get('/*abc$/', (_req, res) => {
//     res.json({ iso: new Date().toISOString(), epoch: Date.now() });
// });


app.get('/time/:format/day/:date', (_req, res,next) => {
    if (_req.params.format !== '123') {
      return  next('Invalid format');
    }
    res.send({ iso: _req.params });
});

const cb0 = function (req: Request, res: Response, next: NextFunction) {
  console.log('CB0');
  next();
};

const cb1 = function (req: Request, res: Response, next: NextFunction) {
  console.log('CB1');
  next();
};

const cb2 = function (req: Request, res: Response) {
  res.send('Hello from C!');
};

app.get('/example/c', [cb0, cb1, cb2]);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(req.path);
});

app.listen(3040, () => {
    console.log('server listening on http://localhost:3040');
});