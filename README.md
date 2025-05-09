# Adelphi Calculator

The **Adelphi Calculator** is a backend Node.js + Express application designed to serve a custom pay calculator for healthcare travel professionals (such as nurses and allied health workers). It helps users compute and understand gross weekly pay based on different contract structures, with a focus on simplicity and speed.

This application is being developed with a TypeScript + Express backend and will eventually support a React-based frontend for interactive use.

---

## 🚀 Features (Planned & In Progress)

- [x] Express.js server setup
- [x] TypeScript integration
- [x] Nodemon + cross-env for local development
- [ ] Serve JSON-based calculation responses
- [ ] Integrate React frontend
- [ ] Accept pay details and return calculated output
- [ ] Deployment (Render, Vercel, or Railway)

---

## 🛠️ Technologies Used

- **Node.js** – Backend runtime
- **Express.js** – Web framework
- **TypeScript** – Type-safe JavaScript
- **Nodemon** – Hot-reloading for dev
- **cross-env** – Cross-platform environment variable support
- **npm** – Package manager

---

## 📁 Project Structure

adelphicalculator/
├── src/
│ └── index.ts # Main server entry point
├── dist/ # Compiled JS (after build)
├── package.json # Project metadata and scripts
├── tsconfig.json # TypeScript configuration
└── README.md # You're reading it!


---

## 🧱 Steps Taken So Far

1. **Project Setup**
   - Initialized with `npm init`
   - Installed Express and TypeScript
   - Created `src/index.ts` as the server entry

2. **Added TypeScript Support**
   - Installed `typescript` and generated a `tsconfig.json`
   - Configured `outDir` to `dist` and `rootDir` to `src`

3. **Script Improvements**
   - Installed `cross-env` to support setting `NODE_ENV=production` across OS
   - Added `build` and `start` scripts to compile and run the server

4. **Configured Express**
   - Basic route handling (`/`) set up in `src/index.ts`
   - Server logs on successful start on port 5000

5. **Ran and Tested the Server**
   - Used `npm start` to build and launch the app
   - Visited `http://localhost:5000` to confirm it’s running

---
