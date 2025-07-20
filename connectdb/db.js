import { Sequelize } from "sequelize";
export const sequelize = new Sequelize('railway', 'root', 'ahFRuBJIdRvdfzhYubqNeNAJDkcGAkbw@767', {
  host: 'mysql.railway.internal',
  dialect: 'mysql'
});

export const db = async()=>{
    try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
} 