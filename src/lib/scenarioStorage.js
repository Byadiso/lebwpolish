export const scenarioKeys=['shadow_mission_index','shadow_step_index','shadow_session_xp','shadow_mission_earnings','shadow_mission_log'];
export function resetScenarioStorage(storage){scenarioKeys.forEach(key=>storage.removeItem(key));}
