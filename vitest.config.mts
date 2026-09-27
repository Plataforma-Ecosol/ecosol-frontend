import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * `.mts` e não `.ts`: o Vite carrega este arquivo como CommonJS quando a
 * extensão é `.ts`, e avisa a cada execução que o `import` do topo é sintaxe
 * ESM. A extensão resolve sem precisar declarar o projeto inteiro como módulo.
 *
 * `jsdom` porque a suíte renderiza componentes e olha o HTML resultante — é
 * assim que a regressão de LGPD do PR Q vai provar que um contato sem
 * consentimento não deixa rastro na tela.
 *
 * `resolve.tsconfigPaths` faz o alias `@/` valer nos testes. É recurso nativo
 * do Vite; o plugin `vite-tsconfig-paths` que costumava ser necessário foi
 * removido do projeto por isso.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
