import path from 'path';

const distPath = './_dist/backend';

class RootPath {
  path: string;

  constructor() {
    const notHot = true !== (process.env.HOT as any);

    this.path = notHot ? process.cwd() : path.resolve(process.cwd(), distPath);
  }
}

export default new RootPath().path;
