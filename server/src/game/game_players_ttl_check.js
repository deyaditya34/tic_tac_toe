const redis_database = require('../database/redis_database.service');
const game_service_in_memory = require('./redis_database.game.service');
const config = require('../config');
const { create_game } = require('./game');

async function check_player_timeout() {
  setInterval(async () => {
    let players_turn_data = JSON.parse(
      await redis_database.client.get(config.CURRENT_PLAYER_TURN_LIST)
    );

    if (!players_turn_data) {
      players_turn_data = [];
    }

    for (const player_data of players_turn_data) {
      const current_time = new Date(Date.now());

      if (new Date(player_data.deactivated_time) <= current_time) {
        const game_data = await game_service_in_memory.get_game(
          player_data.game_id
        );
        const game = new create_game(game_data);

        game.change_current_player_turn(player_data.player_turn);
        game.player_won = game.get_current_player(
          game.players,
          game.current_player_turn
        );
        game.status = 'GAME_OVER';

        await game_service_in_memory.store_game(player_data.game_id, game);
        await game_service_in_memory.delete_game_player_turn_timeout(
          config.CURRENT_PLAYER_TURN_LIST,
          player_data.game_id
        );
      }
    }
  }, 1000);
}

module.exports = { check_player_timeout };
