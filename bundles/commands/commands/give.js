const { Broadcast: B } = require('ranvier');
const ArgParser = require('../../lib/lib/ArgParser');

const dot = ArgParser.parseDot;
const ItemUtil = require('../../lib/lib/ItemUtil');

module.exports = {
  usage: 'дать <предмет> <цель>',
  aliases: ['дать', 'отдать'],
  command: (state) => (args, player) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Что и кому вы хотите дать?');
    }

    let [targetItem, targetRecip] = args.split(' ');

    if (!targetRecip) {
      return B.sayAt(player, 'Кому вы хотите это отдать?');
    }

    targetItem = dot(targetItem, player.inventory);

    if (!targetItem) {
      return B.sayAt(player, 'У вас нет этого.');
    }

    // prioritize players before npcs
    let target = dot(targetRecip, player.room.players);

    if (!target) {
      target = dot(targetRecip, player.room.npcs);
      if (target) {
        const accepts = target.getMeta('accepts');
        if (!accepts || !accepts.includes(targetItem.entityReference)) {
          return B.sayAt(player, `${target.Name} не хочет брать это.`);
        }
      }
    }

    if (!target) {
      return B.sayAt(player, 'Вы не видите цели.');
    }

    if (target.hasAttribute('invisibility') && target.getAttribute('invisibility') > player.getAttribute('detect_invisibility')) {
      return B.sayAt(player, 'Вы не видите цели.');
    } if (target.hasAttribute('hide') && target.getAttribute('hide') > player.getAttribute('detect_hide')) {
      return B.sayAt(player, 'Вы не видите цели.');
    }

    if (target === player) {
      return B.sayAt(player, `<green>Вы переложили ${ItemUtil.display(targetItem)} из одной руки в другую. Отличный трюк.</green>`);
    }

    if (target.isInventoryFull()) {
      if (target.gender === 'male') {
        return B.sayAt(player, 'Он не может нести больше.');
      } if (target.gender === 'female') {
        return B.sayAt(player, 'Она не может нести больше.');
      } if (target.gender === 'plural') {
        return B.sayAt(player, 'Они не могут нести больше.');
      }
      return B.sayAt(player, 'Оно не может нести больше.');
    }

    if (targetItem.getMeta('forSell') > 0) {
      targetItem.setMeta('forSell', 0);
    }

    player.removeItem(targetItem);
    target.addItem(targetItem);

    B.sayAt(player, `<green>Вы дали <white>${target.dname}</white> ${ItemUtil.display(targetItem, 'vname')}.</green>`);
    if (!target.isNpc) {
      if (player.gender === 'male') {
        B.sayAt(target, `<green>${player.Name} дал вам ${ItemUtil.display(targetItem, 'vname')}.</green>`);
        B.sayAtExcept(player.room, `${player.Name} дал ${target.Dname} ${ItemUtil.display(targetItem, 'vname')}.`, [player, target]);
      } else if (player.gender === 'female') {
        B.sayAt(target, `<green>${player.Name} дала вам ${ItemUtil.display(targetItem, 'vname')}.</green>`);
        B.sayAtExcept(player.room, `${player.Name} дала ${target.Dname} ${ItemUtil.display(targetItem, 'vname')}.`, [player, target]);
      } else if (player.gender === 'plural') {
        B.sayAt(target, `<green>${player.Name} дали вам ${ItemUtil.display(targetItem, 'vname')}.</green>`);
        B.sayAtExcept(player.room, `${player.Name} дали ${target.Dname} ${ItemUtil.display(targetItem, 'vname')}.`, [player, target]);
      } else {
        B.sayAt(target, `<green>${player.Name} дало вам ${ItemUtil.display(targetItem, 'vname')}.</green>`);
        B.sayAtExcept(player.room, `${player.Name} дало ${target.Dname} ${ItemUtil.display(targetItem, 'vname')}.`, [player, target]);
      }
    }

    target.emit('take', player, targetItem);
    player.emit('give', target, targetItem);
  },
};
