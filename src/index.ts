import { createApp } from "./server";

const PORT = 3000;
const app = createApp();

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));