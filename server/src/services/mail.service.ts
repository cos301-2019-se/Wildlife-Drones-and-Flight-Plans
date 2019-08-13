import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import * as mailer from 'nodemailer';
import * as Twig from 'twig';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private tp;

  constructor(
    private readonly config: ConfigService,
  ) {
    const cfg = this.config.getConfig();

    this.tp = mailer.createTransport({
      host: cfg.mail.host,
      port: cfg.mail.port,
      secure: true,
      auth: {
        user: cfg.mail.user,
        pass: cfg.mail.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async send(details: {
    to: string;
    subject: string;
    template: string;
    templateParams: {
      [paramName: string]: any;
    };
  }) {
    console.log('sending email', details);
    const config = this.config.getConfig();

    const defaultTemplateParams = {
      applicationName: config.applicationName,
      year: new Date().getFullYear(),
    };

    // const body = `Your PIN is ${details.templateParams.otp}`;

    const body = await new Promise((resolve, reject) => {
      console.log('awaiting promise', `../templates/${details.template}`);

      const templatePath = path.join(process.cwd(), `src/templates/${details.template}`);

      Twig.renderFile(
        templatePath,
        {
          ...details.templateParams as any,
          ...defaultTemplateParams as any,
        },
        (err, html) => {
          console.log(err, html);
          if (err) {
            reject(err);
          } else {
            resolve(html);
          }
        }
      );
    });

    console.log('body', body);

    const message = {
      from: `"${config.applicationName}" <${config.mail.user}>`,
      to: details.to,
      subject: details.subject,
      html: body,
    };

    this.tp.sendMail(message);
  }
}
