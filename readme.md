# Stockedhome Overview

Stockedhome is a home management app to bring the power of meal planning and stock tracking to your home. Powerful, thoughtful tools rest at your fingertips to help you plan your meals, track your pantry, generate nutrition insights, order new ingredients, and share your tastiest recipes with friends, family, and the world.

[![Made with Supabase](https://supabase.com/badge-made-with-supabase-dark.svg)](https://supabase.com)
[![Components made with React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev/)
[![App built with Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)](https://github.com/expo/expo#readme)
[![Web built with Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![API created with tRPC](https://img.shields.io/badge/tRPC-%232596BE.svg?style=for-the-badge&logo=tRPC&logoColor=white)](https://trpc.io/)
[![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)](https://pnpm.io/)
[![Containers through Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![SVGs Designed with Inkscape](https://img.shields.io/badge/Inkscape-e0e0e0?style=for-the-badge&logo=inkscape&logoColor=080A13)](https://inkscape.org/)

# This Repository (Stockedhome Application)

This repository houses the frontend and backend of Stockedhome, built with Next.js, Expo, and Solito. Significant folders:
* `src/platforms/next` - The Next.js (web) part of Stockedhome
* `src/platforms/expo` - The Expo (mobile) part of Stockedhome
* `src/lib` - Logic code that may be shared by both platforms
* `src/interface` - UI code that may be shared by both platforms
* `src/forks` - Forks of third-party libraries used in Stockedhome (included as submodules)
* `codegen` - Code generation scripts and configuration
* `codegen/results` - Generated code from the code generation scripts. Accessible as the `@stockedhome/codegen` package
* `docker-compose-setup` - A Docker Compose setup for running Stockedhome in production mode with a Supabase backend

# Setting Up Your Workspace

### Prerequisite Tools:
* [Node.js](https://nodejs.org/en/)
* [pnpm](https://pnpm.io/)
* For Windows [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
  * Alternatively, if you're on Linux, you can install [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) separately. You will need to do this if your machine does not support KVM virtualization.
* [PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell)

Recommended OS: Linux. Unsure about MacOS because I don't own a Mac. Windows will likely have errors trying to build the development client thanks to Gradle being unable to handle deeply-nested paths, even with extended path support enabled in the OS.

### Getting Started
1. Clone the repository
2. Run `pnpm install` in the root of the repository

### Configuring the Application

A sample `.env.example` file is provided in the root of the repository. Copy this file to `.env` (do not simply rename it) and fill in the necessary values. The `.env` file is used during development and build to supply important information for all platforms.

Additionally, further configuration can be found in the `config` folder. You may wish to adjust `config.dev.yaml` to your specific purposes.

### Running the Application (Dev Mode)
No matter what, you will always need the Next.js web server running. To start it, run `pnpm run dev:next` in the root of the repository.

You can connect to the web server, which defaults to `http://localhost:3000`. You may wish to load the webpage to make sure it works.

For running the mobile app, you have two options:
1. Run `pwsh scripts/expo-dev-chooser`, which will prompt you to choose a platform to run the Expo development client on. This will start the development server and build the development client for your chosen platform.
2. Run the `pnpm run dev:expo:PLATFORM` with your phone's OS (e.g. `pnpm run dev:expo:ios` or `pnpm run dev:expo:android`) which will build the development client (native code) for your device and start the dev server (for JavaScript code) automatically. If your phone already has the development client installed, you can run `pnpm run dev:expo:dev` to start the development server.

### Building the Web & Native Applications
To build the Next.js site, run `pwsh scripts/build-nextjs-site`. This will create Docker containers for the web server (one with static assets and one without), create the `dist/web-server-docker-compose` folder for a Docker Compose setup to run the server, and accumulate static files in the `dist/web-server-static` folder.

To build the Expo app (using EAS' --local option), run `pwsh scripts/build-expo-app`. It will prompt you for the necessary variables. Some notes:
* You will need to know the build profile you wish to use. You may find the valid options in `src/platforms/expo/eas.json`.
* If you are building for iOS, you must be running MacOS.
* It's possible you may need to install additional tooling. The EAS build process should inform you if you need to do so.

# Stockedhome In Detail

## Do You [Dogfood](https://en.wikipedia.org/wiki/Eating_your_own_dog_food)?
Hell yeah I do! This application was developed with my own personal use in mind. Observing the frustration of myself, my family, and the general public is plenty enough to motivate building such an application.

## Where Our Funding Comes From
Stockedhome is a free and fauxpen-source project. For the SaaS version, funding is provided through our partnered retailers' affiliate programs. If you opt to self-host instead, we wish you the best of luck and promise to always provide you with a fully-featured, fully-documented, free, and fauxpen-source version of Stockedhome. The self-hosted version should never be any different than the cloud-hosted version outside of the initial setup.

## Fauxpen-Source?
Stockedhome is a fauxpen-source project. We believe in the power of open-source software and the community that surrounds it ([and I've released a fair bit of truly-open-source software](https://github.com/BellCubeDev)), however we recognize the risk of the application's code being used for commercial purposes by less-than-benevolent entities; that is, large, freeloading corporations. As such, Stockedhome is licensed under a license which prohibits the commercial use of the software. This does not comply with the commonly-accepted definition of open-source software, but we believe it is the best way to protect the project while still providing the benefits of open-source software to consumers.

Unfortunately, pure anarchy leaves little room for beneficial orchestration as those orchestrating beneficially will eventually be choked by those who orchestrate malevolently.

### What License Terms Don't Comply With "Open Source"?
The only terms that do not comply with the Open Source Initiative's definition of open-source software are those that prohibit the commercial use of the software. Outside of that, the software is fully open-source and free to self-host, modify, and redistribute as you see fit.

### Why Is This Alright?
Stockedhome is an end-user application. It is not a library, framework, or other tool that developers would use to build their own applications. As such, the restrictions on commercial use only serve to hamper large, freeloading corporations rather than startups who can't afford to rent our tech. We encourage users to host their own instances of Stockedhome. The only caveat is that you cannot charge for access to the software or otherwise use it to make money. See the license for more information.

### What If I Want To Use Stockedhome Commercially?
Don't.

### What License Is Stockedhome Under?
Stockedhome uses Bell's Strictly Non-Commercial MPL-2.0 v1.0 (BSNC-MPL-2.0-1.0), **a modified version** of the Mozilla Public License 2.0 (MPL-2.0). The modifications are as follows:
  * Define "Commercial Use"
    * Important to note that Commercial Use as it is defined here includes advertisement, data collection, using the partner programs included in Stockedhome, and so forth. See the license text for mode information.
  * Define "Significant Portion of Covered Software"
  * Alter definition of "Larger Work" to reference Significant Portion of Covered Software
  * Add a clause prohibiting Commercial Use as defined earlier
