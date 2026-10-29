const Table = require('../models/Table');

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, count: tables.length, tables });
  } catch (error) { next(error); }
};

const getAvailableTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ status: 'AVAILABLE' }).sort({ tableNumber: 1 });
    res.json({ success: true, count: tables.length, tables });
  } catch (error) { next(error); }
};

const createTable = async (req, res, next) => {
  try {
    const { tableNumber, label, capacity } = req.body;
    if (!tableNumber) return res.status(400).json({ success: false, message: 'Table number is required' });
    const table = await Table.create({
      tableNumber,
      label: label || `Table ${tableNumber}`,
      capacity: capacity || 4,
      qrCode: `wrapchik://dine-in?table=${tableNumber}`,
    });
    res.status(201).json({ success: true, table });
  } catch (error) { next(error); }
};

const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    const { label, capacity, status } = req.body;
    if (label !== undefined) table.label = label;
    if (capacity !== undefined) table.capacity = capacity;
    if (status !== undefined) table.status = status;
    if (status === 'AVAILABLE') table.currentOrderId = null;
    await table.save();
    res.json({ success: true, table });
  } catch (error) { next(error); }
};

module.exports = { getTables, getAvailableTables, createTable, updateTable };
