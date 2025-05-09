const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    colors: {
      ...colors,
    },
    extend: {
      // tes extensions ici...
    },
  },
  variants: [],
  plugins: [
    require("@tailwindcss/forms"),
    plugin(function ({ addComponents, theme }) {
      const screens = theme("screens", {});
      addComponents([
        { ".container": { width: "100%" } },
        {
          [`@media (min-width: ${screens.sm})`]: {
            ".container": { "max-width": "640px" },
          },
        },
        // etc.
      ]);
    }),
  ],
};
