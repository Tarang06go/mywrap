const GroupOrder = require('../models/GroupOrder');
const crypto = require('crypto');

const createGroup = async (req, res, next) => {
  try {
    const { orderType, hostel, roomNumber, tableId, maxMembers } = req.body;
    const groupCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const group = await GroupOrder.create({
      groupCode,
      leaderId: req.user._id,
      members: [{ userId: req.user._id, name: req.user.name, status: 'JOINED' }],
      orderType,
      hostel,
      roomNumber,
      tableId,
      maxMembers: maxMembers || 8,
    });

    res.status(201).json({ success: true, group });
  } catch (error) { next(error); }
};

const joinGroup = async (req, res, next) => {
  try {
    const { groupCode } = req.body;
    const group = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() });
    
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ success: false, message: 'Group is no longer open' });
    
    const activeMembersCount = group.members.filter(m => m.status === 'JOINED').length;
    if (activeMembersCount >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    const existingMember = group.members.find(m => m.userId.toString() === req.user._id.toString());
    if (existingMember) {
      if (existingMember.status === 'JOINED') {
        return res.status(400).json({ success: false, message: 'Already joined this group' });
      } else {
        existingMember.status = 'JOINED';
      }
    } else {
      group.members.push({ userId: req.user._id, name: req.user.name, status: 'JOINED' });
    }

    await group.save();
    res.json({ success: true, group });
  } catch (error) { next(error); }
};

const getGroupDetails = async (req, res, next) => {
  try {
    const group = await GroupOrder.findById(req.params.id).populate('members.userId', 'name email');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, group });
  } catch (error) { next(error); }
};

const lockGroup = async (req, res, next) => {
  try {
    const group = await GroupOrder.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.leaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only leader can lock the group' });
    }
    
    group.status = 'LOCKED';
    await group.save();
    res.json({ success: true, group, message: 'Group locked' });
  } catch (error) { next(error); }
};

const leaveGroup = async (req, res, next) => {
  try {
    const group = await GroupOrder.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const memberIndex = group.members.findIndex(m => m.userId.toString() === req.user._id.toString());
    if (memberIndex === -1) return res.status(400).json({ success: false, message: 'Not a member of this group' });

    group.members[memberIndex].status = 'LEFT';

    if (group.leaderId.toString() === req.user._id.toString()) {
      const nextMember = group.members.find(m => m.status === 'JOINED' && m.userId.toString() !== req.user._id.toString());
      if (nextMember) {
        group.leaderId = nextMember.userId;
      } else {
        // Empty group, we can delete or keep it as LEFT
        // Just leave it as LEFT for now, status COMPLETED or something?
        // Actually, let's keep it simple.
      }
    }

    await group.save();
    res.json({ success: true, message: 'Left the group successfully', group });
  } catch (error) { next(error); }
};

module.exports = { createGroup, joinGroup, getGroupDetails, lockGroup, leaveGroup };
