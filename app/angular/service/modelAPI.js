import angular from "angular";

const API_URL = process.env.API_URL || 'http://localhost:3000'

const authService = ($http) => {
	const _saveModel = function (model) {
		return $http.post(`${API_URL}/models`, model).then(function (newModel) {
			return newModel.data;
		});
	};

	const _getAllModels = function (_userId) {
		return $http
			.get(`${API_URL}/models`, {
				params: { userId: _userId },
			})
			.then(function (res) {
				return res;
			});
	};

	const _updateModel = function (model) {
		return $http.put(`${API_URL}/models/${model.id}`, model).then(function (resp) {
			return resp;
		});
	};

	const _getModel = function (_modelId, _userId) {
		return $http
			.get(`${API_URL}/models/:modelId`, {
				params: { userId: _userId, modelId: _modelId },
			})
			.then(function (resp) {
				return resp;
			});
	};

	const _deleteModel = function (_modelId) {
		return $http
			.delete(`${API_URL}/models/:modelId`, {
				params: { modelId: _modelId },
			})
			.then(function (resp) {
				return resp;
			});
	};

	const _renameModel = function (_modelId, newName) {
		return $http
			.put(`${API_URL}/models/${_modelId}/rename`, { name: newName })
			.then(function (resp) {
				return resp;
			});
	};

	const _loadShareOptions = function (_modelId) {
		return $http
			.get(`${API_URL}/models/${_modelId}/share/options`)
			.then(function (resp) {
				return resp;
			});
	};

	const _toggleShare = function (modelId, active, importAllowed) {
		return $http
			.post(`${API_URL}/models/share`, { "modelId": modelId, "active": active, "importAllowed": importAllowed })
			.then(function (resp) {
				return resp;
			});
	};

	const _getSharedModel = function (shareId) {
		return $http
			.get(`${API_URL}/models/share/${shareId}`)
			.then(function (resp) {
				return resp;
			});
	};

	const _importModel = function (shareId, userId) {
		return $http
			.post(`${API_URL}/models/import`, { shareId, userId })
			.then(function (resp) {
				return resp;
			});
	};

	const _duplicate = function (modelId, userId, newName) {
		return $http
			.post(`${API_URL}/models/${modelId}/duplicate`, { "userId": userId, "newName": newName })
			.then(function (resp) {
				return resp;
			});
	};

	return {
		saveModel: _saveModel,
		getAllModels: _getAllModels,
		getModel: _getModel,
		updateModel: _updateModel,
		deleteModel: _deleteModel,
		renameModel: _renameModel,
		loadShareOptions: _loadShareOptions,
		toggleShare: _toggleShare,
		getSharedModel: _getSharedModel,
		importModel: _importModel,
		duplicate: _duplicate
	};
};

export default angular
	.module("app.modelAPI", [])
	.factory("ModelAPI", authService).name;
