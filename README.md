🦅 Avian Translator (鸟语解码器)

Bio-Acoustic Analysis System | 生物声学分析系统

This application is a real-time bio-acoustic analysis tool designed to detect audio frequencies from the environment and decode them into "bird language". It visualizes sound waves and matches dominant frequencies with a database of bird species using a center-frequency distance algorithm.

本项目是一个实时生物声学分析工具，旨在检测环境中的音频频率并将其解码为“鸟语”。它能够可视化声波，并使用中心频率距离算法将捕捉到的主频与鸟类数据库进行匹配。

👤 Author | 作者

Yang Su École Normale Supérieure - PSL 📧 Email: yang.su@ens.fr


<img width="1340" height="898" alt="image" src="https://github.com/user-attachments/assets/eb866717-5b39-4ae4-bd5d-93299cee998a" />



🚀 Installation | 安装说明

Windows

Download the installer: AvianTranslator Setup 1.0.0.exe.

Double-click the .exe file to install.

The app will launch automatically after installation.

Windows (安装步骤)

下载安装包：AvianTranslator Setup 1.0.0.exe。

双击 .exe 文件进行安装。

安装完成后程序会自动启动。

🎮 How to Use | 使用指南

Initialize: Click the large Power Button in the center to start the system.

Permission: Allow microphone access when prompted (essential for frequency detection).

Scanning: The system will enter SCANNING mode, visualizing real-time audio waveforms and spectrograms.

Decoding: When a distinct frequency is detected, the system switches to DECODING mode.

Result: The matched bird species, its message, and the detected frequency (Hz) will be displayed on the screen.

Language: Use the flag icon in the top right corner to switch languages (English, Chinese, Japanese, French, etc.).

启动：点击屏幕中央的电源按钮启动系统。

权限：在弹窗中允许麦克风访问（这是检测频率所必需的）。

扫描：系统将进入扫描模式，实时显示声波和频谱图。

解码：当检测到明显频率时，系统切换至解码模式。

结果：屏幕将显示匹配的鸟类品种、它“说”的话以及检测到的频率（Hz）。

语言：点击右上角的旗帜图标可切换语言（支持中、英、法、日等）。

🛠️ Technology Stack | 技术栈

Core: React, Vite

Desktop Wrapper: Electron

Styling: Tailwind CSS, Tailwind Animate

Audio Analysis: Web Audio API (FFT, Frequency Data)

Icons: Lucide React

© Copyright

Copyright © 2024 Yang Su, École Normale Supérieure - PSL. All rights reserved.



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
