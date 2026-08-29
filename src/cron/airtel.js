import {
  updateSimInventory,
  upsertSimInventoryBulk
} from '../dao';
import sequelize from '../models';
import {
  getAllAirtelSimList,
} from '../utils';

export const syncSimInventory = async () => {
  const simList = await getAllAirtelSimList();
  // console.log("SIM LIST:", simList);
  // Bulk upsert
  const simInventoryData = simList.map(item => ({
    sim_number: item.simNo.trim(),
    status: item.status
  }));
  // console.log("SIM INVENTORY DATA:", simInventoryData);
  const t = await sequelize.transaction();
  try {
    await upsertSimInventoryBulk(simInventoryData, t); 
    await t.commit();
    console.log("SIM INVENTORY UPDATED SUCCESSFULLY");
  } catch (error) {
    console.log("SIM INVENTORY UPDATION FAILED:", error);
    await t.rollback();
  }
};
