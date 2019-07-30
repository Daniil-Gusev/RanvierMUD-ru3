'use strict';

const { Broadcast } = require('ranvier');
const ItemUtil = require('../../bundle-lib/lib/ItemUtil');

module.exports = {
  usage: 'инвентарь',
  aliases: ['инвентарь'],
  command : (state) => (args, player) => {
    if (!player.inventory || !player.inventory.size) {
      return Broadcast.sayAt(player, "У вас нет ничего.");
    }

    Broadcast.at(player, "Вы несете");
    if (isFinite(player.inventory.getMax())) {
      Broadcast.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
    }
    Broadcast.sayAt(player, ':');

    // TODO: Implement grouping
    for (const [, item ] of player.inventory) {
      Broadcast.sayAt(player, ItemUtil.display(item));
    }
  }
};
