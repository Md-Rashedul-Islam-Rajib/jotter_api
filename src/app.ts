import express, { Application, Request, Response } from 'express';
import router from './app/routes';
import cors from 'cors';
import os from 'os';
import cookieParser from 'cookie-parser';
import { handleErrors } from './app/utilities/handleErrors';

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));
app.use('/', router);
app.use(handleErrors);




app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();
  res.send({
    success: true,
    message: "Welcome to jotter apis",
    version: "1.0.0",
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60
      )} minutes`,
    },
    developerContact: {
      email: "rajib5570@gmail.com",
   
    },
  });
});


export default app;
