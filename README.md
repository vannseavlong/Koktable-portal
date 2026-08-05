# Restaurant Admin

Admin portal for the restaurant reservation app — manage reservations, the
services catalogue (content), and user accounts. Talks to the `restaurant_sheetDB` API
in the sibling `Backend` repo; see that repo's `ADMIN_API.md` for the
endpoint contract this app is built against.

Built on top of the [shadcn-admin](https://github.com/satnaing/shadcn-admin)
template (MIT licensed — see `LICENSE`).

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons) (Brand icons only)

## Run Locally

```bash
pnpm install
pnpm dev
```

Requires the `paw_sheetDB` API running locally (`cd ../paw_sheetDB && pnpm dev`)
and an admin account — see that repo's `ADMIN_API.md` for how to seed one.

## License

Licensed under the [MIT License](LICENSE).
