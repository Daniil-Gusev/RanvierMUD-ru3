'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const ArgParser = require('../../lib/lib/ArgParser');
const dot = ArgParser.parseDot;

module.exports = {
  aliases: ['помочь'],
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args || !args.length) {
      return B.sayAt(player, 'Кому вы хотите помочь?');
    }

    let target = dot(args, player.room.players);

    if (target) {
      if (target.hasAttribute('invisibility') && target.getAttribute('invisibility') > player.getAttribute('detect_invisibility')) {
        return B.sayAt(player, "Вы его не видите.");
      }
      if (target.hasAttribute('hide') && target.getAttribute('hide') > player.getAttribute('detect_hide')) {
        return B.sayAt(player, "Вы не можете его разглядеть.");
      }
    }

    if (!target) {
      return B.sayAt(player, "Хмм. Похоже этого персонажа здесь нет.");
    }

    if (!target.isInCombat()) {
      return B.sayAt(player, target.Dname + " не нужна помощь.");
    }

    const enemy = [...target.combatants][0];

    B.sayAt(player, `Вы бросаетесь на помощь ${target.dname}.`);

    player.initiateCombat(enemy);
    B.sayAtExcept(player.room, `${player.name} бросается на помощь ${target.dname}!`, [player, target]);
    if (!target.isNpc) {
      B.sayAt(target, `<b>${player.name} бросается ВАМ на помощь!</b>`);
    }
  }
};
