export default class ScheduleService {
    static async syncSchedule(env) {
        const { LarkUserService } = env;
        await LarkUserService.syncUsersToDatabase(env);
    }

    
}