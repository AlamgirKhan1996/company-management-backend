const app = require('./app');
const departmentRoutes = require("./routes/department");



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
app.use("/api/departments", departmentRoutes);
