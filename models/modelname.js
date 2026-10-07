'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ModelName extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ModelName.init({
    column1: DataTypes.STRING,
    column2: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ModelName',
  });
  return ModelName;
};