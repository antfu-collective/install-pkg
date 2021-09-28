# install-pkg

[![NPM version](https://img.shields.io/npm/v/install-pkg?color=a1b858&label=)](https://www.npmjs.com/package/install-pkg)

Install package programmatically. Detect package managers automatically (`npm`, `yarn` and `pnpm`).

```bash
npm i install-pkg
```

```ts
import { installPackage } from 'install-pkg'

await installPackage('vite', { silent: true })
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
