const rolesRouter = require('./Roles/role.routes');
const authRouter = require('./Auth/auth.routes');
const usersRouter = require('./Users/user.routes');
const financeRouter = require('./Finance/finance.routes');
const dashboardRouter = require('./Dashboard/dashboard.routes');
const financialRecordsCategoryRouter = require('./Financial_Records_Category/financialRecordsCategory.routes');

function routes(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/finance', financeRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/financial_records_category', financialRecordsCategoryRouter);
}

module.exports = routes;