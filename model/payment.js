import { DataTypes,Sequelize } from "sequelize";
import { sequelize } from "../connectdb/db.js";
import User from "./user.js";
export const Payment = sequelize.define('payment',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    orderId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    paymentSessionId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    orderCurrency:{
        type:DataTypes.STRING,
        allowNull:false
    },
    orderAmount:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    paymentStatus:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:"pending"
    }
})
User.hasMany(Payment, {
    foreignKey: 'userId'
});

Payment.belongsTo(User, {
    foreignKey: 'userId'
});