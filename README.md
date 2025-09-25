# Fluxo - Automação Inteligente para PMEs

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/titorm/auto-flow-cloudfare)

Fluxo is a sophisticated, AI-powered automation platform designed to empower Brazilian Small and Medium-sized Enterprises (SMEs). The application's core is a visually stunning and intuitive drag-and-drop workflow builder, supercharged by a conversational AI assistant. Users can describe their desired automation in natural Portuguese, and the AI will generate a complete workflow. The platform prioritizes deep, native integrations with essential tools for the Brazilian market, such as WhatsApp Business API, PIX payment gateways, and popular local ERP systems, making complex automation accessible to everyone.

## ✨ Key Features

- **Visual Workflow Builder**: An intuitive drag-and-drop canvas (powered by ReactFlow) to design, build, and manage complex automations visually.
- **Conversational AI Assistant**: Describe your automation needs in natural language, and our AI will generate a ready-to-use workflow suggestion.
- **Brazilian Market Focus**: Native, first-class integrations with tools essential for Brazilian SMEs, including WhatsApp, PIX, and local ERPs.
- **Secure Authentication**: Robust and secure user registration and login system to protect user data.
- **Responsive & Modern UI**: A clean, minimalist, and fully responsive interface built for an exceptional user experience on any device.
- **Real-time Execution**: A powerful backend engine designed to execute workflows reliably and provide instant feedback.

## 🛠️ Technology Stack

This project is built with a modern, high-performance technology stack, ensuring a robust and scalable application.

- **Frontend**:
  - **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
  - **Language**: [TypeScript](https://www.typescriptlang.org/)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/guide/packages/lucide-react)
  - **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query](https://tanstack.com/query/latest)
  - **Animation**: [Framer Motion](https://www.framer.com/motion/)
  - **Routing**: [React Router](https://reactrouter.com/)
  - **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
  - **Workflow Canvas**: [ReactFlow](https://reactflow.dev/)

- **Backend & Platform**:
  - **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
  - **API Framework**: [Hono](https://hono.dev/)
  - **Durable Objects**: For stateful serverless agents via [Cloudflare Agents SDK](https://developers.cloudflare.com/workers/agents/).

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/fluxo_ai_automation.git
    cd fluxo_ai_automation
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure Environment Variables:**

    The project uses Cloudflare Workers for its backend. You'll need to set up your Cloudflare account and obtain the necessary credentials.

    First, log in to Cloudflare:
    ```bash
    bunx wrangler login
    ```

    Next, update the `wrangler.jsonc` file with your Cloudflare Account ID and a unique name for your project. You will also need to configure your AI Gateway credentials in the `[vars]` section.

    ```jsonc
    // wrangler.jsonc
    {
      // ...
      "name": "fluxo-ai-automation-your-name",
      "vars": {
        "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
        "CF_AI_API_KEY": "your-cloudflare-api-key"
      }
      // ...
    }
    ```

4.  **Run the development server:**
    ```bash
    bun run dev
    ```
    This command will start the Vite frontend development server and the Wrangler server for the backend worker simultaneously. The application will be available at `http://localhost:3000`.

## 🔧 Development

- **Frontend**: The main application code is located in the `src/` directory.
  - Pages are in `src/pages/`.
  - Reusable components are in `src/components/`.
  - State management stores are in `src/lib/`.
- **Backend**: The Cloudflare Worker code is in the `worker/` directory.
  - The main entry point is `worker/index.ts`.
  - API routes are defined in `worker/userRoutes.ts`.
  - The core agent logic is in `worker/agent.ts`.

## ☁️ Deployment

This project is designed for seamless deployment to the Cloudflare global network.

### One-Click Deploy

You can deploy this application to your own Cloudflare account with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/titorm/auto-flow-cloudfare)

### Manual Deployment

1.  **Build the application:**
    This command bundles the React frontend and prepares the worker for deployment.
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    This command uploads your application to Cloudflare Workers.
    ```bash
    bun run deploy
    ```

After deployment, Wrangler will provide you with the URL where your application is live.