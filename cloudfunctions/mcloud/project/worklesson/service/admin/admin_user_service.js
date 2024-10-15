/**
 * Notes: 用户管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-01-22  07:48:00
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');

const util = require('../../../../framework/utils/util.js');
const exportUtil = require('../../../../framework/utils/export_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const UserModel = require('../../model/user_model.js');
const LessonLogModel = require('../../model/lesson_log_model.js');
const AdminHomeService = require('./admin_home_service.js');
const MeetService = require('../meet_service.js');

// 导出用户数据KEY
const EXPORT_USER_DATA_KEY = 'EXPORT_USER_DATA';

class AdminUserService extends BaseProjectAdminService {


	/** 获得某个用户信息 */
	async getUser({
		userId,
		fields = '*'
	}) {
		let where = {
			USER_MINI_OPENID: userId,
		}
		return await UserModel.getOne(where, fields);
	}

	/** 取得用户分页列表 */
	async getUserList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		oldTotal = 0
	}) {

		orderBy = orderBy || {
			USER_ADD_TIME: 'desc'
		};
		let fields = '*';


		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				USER_NAME: ['like', search]
			},
			{
				USER_MOBILE: ['like', search]
			},
			{
				USER_MEMO: ['like', search]
			},
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					where.and.USER_STATUS = Number(sortVal);
					where.and.USER_TYPE = 1;
					break;
				case 'type':
					where.and.USER_TYPE = Number(sortVal);
					break;
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'USER_ADD_TIME');
					break;
				}
			}
		}
		let result = await UserModel.getList(where, fields, orderBy, page, size, true, oldTotal, false);


		// 为导出增加一个参数condition
		result.condition = encodeURIComponent(JSON.stringify(where));

		return result;
	}


	async statusUser(id, status, reason) {
		// this.AppError('[课时]该功能暂不开放');
		let where = {
			_id: id
		}
		let data = {
			USER_STATUS: status
		}
		if (status === 0) {
			data.USER_STATUS_REASON = reason;
		}
		return await UserModel.insertOrUpdate(where, data);
	}


	/**添加用户 */
	async insertUser(admin, { name, mobile, lessonCnt }) {
		// this.AppError('[课时]该功能暂不开放');
		let where = {
			USER_MOBILE: mobile
		}
		let user = await UserModel.getOne(where);
		if (user) {
			// 更新用户
			let data = {
				USER_NAME: name,
				USER_LESSON_TOTAL_CNT: lessonCnt,
				USER_TYPE: 0,
				USER_STATUS: UserModel.STATUS.COMM
			}
			return await UserModel.insertOrUpdate(where, data);
		} else {
			// 添加新的用户
			let data = {
				USER_MINI_OPENID: mobile,
				USER_NAME: name,
				USER_MOBILE: mobile,
				USER_LESSON_TOTAL_CNT: lessonCnt,
				USER_LESSON_USED_CNT: 0,
				USER_STATUS: UserModel.STATUS.COMM,
				USER_TYPE: 0,
				USER_ADD_TIME: this._timestamp,
				USER_ADD_IP: false
			}
			return await UserModel.insert(data);
		}
	}

	/**删除用户 */
	async delUser(id) {
		// this.AppError('[课时]该功能暂不开放');
		let where = {
			_id: id
		}
		return await UserModel.del(where);
	}

	// #####################导出用户数据

	/**获取用户数据 */
	async getUserDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_USER_DATA_KEY);
	}

	/**删除用户数据 */
	async deleteUserDataExcel() {
		// this.AppError('[课时]该功能暂不开放');
		return await exportUtil.deleteDataExcel(EXPORT_USER_DATA_KEY);
	}

	/**导出用户数据 */
	async exportUserDataExcel(condition, fields) {
		// this.AppError('[课时]该功能暂不开放');
		return await exportUtil.exportDataExcel(EXPORT_USER_DATA_KEY, '用户数据', 0, condition, fields);
	}

}

module.exports = AdminUserService;
