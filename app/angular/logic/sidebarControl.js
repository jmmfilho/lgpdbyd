import angular from "angular";
import template from "./sidebarControl.html";
import Column from "../service/Column";
const consentLogic = require('../service/consentLogic');

const Controller = function (LogicService, $rootScope, $timeout) {
	const $ctrl = this;

	$ctrl.visible = true;
	$ctrl.views = [];

	$ctrl.sections = {
		tableProperties: true,
		columns: false,
		views: false,
	}

	$ctrl.abaSelecionada = null;

	$rootScope.$on('command:openmenu', () => {
		$timeout(() => {
			$ctrl.visible = true;
		});
	});

	$ctrl.selecionarAba = function (aba) {
		if ($ctrl.abaSelecionada === aba) {
			$ctrl.abaSelecionada = null; // Desseleciona se já estiver ativa
		} else {
			$ctrl.abaSelecionada = aba;
		}
	};

	$ctrl.swapTitular = (value) => {
		if (value) {
			$ctrl.selectedElement.attributes.attrs[".uml-class-attrs-rect"]['stroke-dasharray'] = 5
			$ctrl.selectedElement.attributes.attrs[".uml-class-methods-rect"]['stroke-dasharray'] = 5
			$ctrl.selectedElement.attributes.attrs[".uml-class-name-rect"]['stroke-dasharray'] = 5
		} else {
			$ctrl.selectedElement.attributes.attrs[".uml-class-attrs-rect"]['stroke-dasharray'] = 0
			$ctrl.selectedElement.attributes.attrs[".uml-class-methods-rect"]['stroke-dasharray'] = 0
			$ctrl.selectedElement.attributes.attrs[".uml-class-name-rect"]['stroke-dasharray'] = 0
		}
		$ctrl.changeName()
	}

	$ctrl.toggleSection = (section) => {
		$ctrl.sections[section] = !$ctrl.sections[section];
	}

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
	}

	$ctrl.changeName = () => {
		if ($ctrl.selectedName) {
			LogicService.editName($ctrl.selectedName);
		}
	}

	$ctrl.deleteColumn = ($index) => {
		LogicService.deleteColumn($index);
	}

	$ctrl.getTableOriginName = (tableId) => {
		const tables = [...$ctrl.mapTables].map(([name, value]) => ({ name, value }));
		return tables.find(() => tableId)?.name;
	}

	$ctrl.editionColumnMode = (column) => {
		loadTableNames();
		const columnValues = JSON.parse(JSON.stringify(column));
		$ctrl.editColumnModel = {
			...columnValues,
			tableOrigin: {
				...columnValues.tableOrigin,
				idName: $ctrl.getTableOriginName(columnValues.tableOrigin.idOrigin),
			}
		};
		$ctrl.closeAllColumns();
		column.expanded = true;
	}

	$ctrl.closeAllViews = () => {
		$ctrl.views.forEach(view => {
			view.expanded = false;
		});
	}

	$ctrl.editView = (view) => {
		$ctrl.closeAllViews();
		view.expanded = true;
	}

	$ctrl.editColumn = (editedColumn, $index) => {
		const column = $ctrl.checkColumnBeforeSave(editedColumn);

		if (column) {
			LogicService.editColumn($index, editedColumn);
			$ctrl.closeAllColumns();
		}
	}

	$ctrl.closeAllColumns = function () {
		$ctrl.columns.forEach(column => {
			column.expanded = false;
		});
	}

	$ctrl.checkColumnBeforeSave = function (column) {
		if (column.name == "") {
			$ctrl.showFeedback("The column name cannot be empty!", true, "error");
			return;
		}

		if (column.FK && column.tableOrigin.idName == "") {
			$ctrl.showFeedback("Select the foreign table source!", true, "error");
			return;
		} else {
			column.tableOrigin.idOrigin = $ctrl.mapTables.get(column.tableOrigin.idName);
		}

		return column;
	}

	$ctrl.addColumn = function (addedColumn) {
		const column = $ctrl.checkColumnBeforeSave(addedColumn);

		if (column) {
			LogicService.addColumn(column);
			$ctrl.addColumnModel = $ctrl.newColumnObject();
			$ctrl.addColumnVisible = false;
		}
	}

	$ctrl.showAddColumn = function (show) {
		$ctrl.addColumnVisible = show;
		$ctrl.addColumnModel = $ctrl.newColumnObject();
		loadTableNames();
	}

	const loadTableNames = () => {
		$ctrl.tableNames = [];
		$ctrl.mapTables = LogicService.getTablesMap();
		for (var key of $ctrl.mapTables.keys()) {
			$ctrl.tableNames.push({ name: key, type: key });
		}
	}

	$ctrl.newColumnObject = function () {
		return new Column();
	}

	$ctrl.addColumnModel = $ctrl.newColumnObject();
	$ctrl.editColumnModel = $ctrl.newColumnObject();

	$ctrl.clearSidebar = () => {
		$ctrl.selectedElement = null;
		$ctrl.selectedName = null;
		$ctrl.selectedType = null;
		$ctrl.columns = null;
	}

	$ctrl.$onChanges = (changes) => {
		if (!changes.selected.currentValue) $ctrl.clearSidebar();
		if (changes.selected != null && changes.selected.currentValue != null) {
			$ctrl.selectedElement = changes.selected.currentValue;
			$ctrl.selectedName = changes.selected.currentValue.attributes.name;
			$ctrl.selectedType = changes.selected.currentValue.attributes.type;
			$ctrl.columns = changes.selected.currentValue.attributes.objects;
			$ctrl.queryConditions = changes.selected.currentValue.attributes.queryConditions;
			if ($ctrl.selectedType === 'uml.Class') {
				$ctrl.views = LogicService.loadViewsByTable(changes.selected.currentValue.id);
			}
		}
	}

	//propositos consent
	$ctrl.propositos = consentLogic.getPurposes() || [];

	$ctrl.visualizarCodigo = false;
	$ctrl.mostrarFormulario = false;
	$ctrl.codigoPurposes = consentLogic.getPurposesText();
	function atualizarPropositos() {
		$ctrl.propositos = consentLogic.getPurposes();
		$ctrl.codigoPurposes = consentLogic.getPurposesText();
	}


	$ctrl.novoProposito = {
		name: '',
		parent: '',
		comment: ''
	};

	$ctrl.excluirProposito = function (name) {
		consentLogic.removePurpose(name);
		atualizarPropositos();
	};

	$ctrl.confirmarNovoProposito = function () {
		if (!$ctrl.novoProposito.name) {
			alert('Nome é obrigatório!');
			return;
		}

		consentLogic.addPurpose({
			name: $ctrl.novoProposito.name,
			parent: $ctrl.novoProposito.parent || null,
			comment: $ctrl.novoProposito.comment || null
		});

		$ctrl.novoProposito = { name: '', parent: '', comment: '' };
		$ctrl.mostrarFormulario = false;
		atualizarPropositos();
	};

	$ctrl.cancelarNovoProposito = function () {
		$ctrl.novoProposito = { name: '', parent: '', comment: '' };
		$ctrl.mostrarFormulario = false;
	};


	//consentimento consent
	$ctrl.visualizarCodigoConsentimentos = false;
	$ctrl.mostrarFormularioConsentimento = false;
	$ctrl.consentimentos = consentLogic.getConsentment();
	$ctrl.codigoConsentimentos = consentLogic.getConsentmentText();
	function atualizarConsentimentos() {
		$ctrl.consentimentos = consentLogic.getConsentment();
		$ctrl.codigoConsentimentos = consentLogic.getConsentmentText();
		waitloadTableNames()
	}
	$ctrl.novoConsentimento = {
		nome: "",
		tipo: "allow",
		propositos: [],
		tabela: "",
		colunas: [],
		condicao: ""
	};

	$ctrl.tabelasDisponiveis

	//essa é a variável q eu quero com as tabelas disponíveis
	function waitloadTableNames() {
		setTimeout(() => {
			$ctrl.mapTablesDetalhadas = LogicService.buildTablesJson();
			$ctrl.tabelasDisponiveis = Array.from($ctrl.mapTablesDetalhadas.values());
		}, 1000); // ou até 2000ms, conforme necessário
	}
	waitloadTableNames()

	$ctrl.getColunas = function (nomeTabela) {
		const tabela = $ctrl.tabelasDisponiveis.find(t => t.name === nomeTabela);
		return tabela ? tabela.columns.map(col => col.name) : [];
	};

	$ctrl.togglePropositoConsentimento = function (pName) {
		const index = $ctrl.novoConsentimento.propositos.indexOf(pName);
		if (index === -1) {
			$ctrl.novoConsentimento.propositos.push(pName);
		} else {
			$ctrl.novoConsentimento.propositos.splice(index, 1);
		}
	};

	$ctrl.toggleColunaConsentimento = function (pName) {
		const index = $ctrl.novoConsentimento.colunas.indexOf(pName);
		if (index === -1) {
			$ctrl.novoConsentimento.colunas.push(pName);
		} else {
			$ctrl.novoConsentimento.colunas.splice(index, 1);
		}
	};

	$ctrl.cancelarNovoConsentimento = function () {
		$ctrl.novoConsentimento = { nome: "", tipo: "allow", propositos: [], tabela: "", colunas: [], condicao: "" };
		$ctrl.mostrarFormularioConsentimento = false;
	};

	$ctrl.confirmarNovoConsentimento = function () {
		if (!$ctrl.novoConsentimento.nome) {
			alert('Nome é obrigatório!');
			return;
		}

		consentLogic.addConsentment({
			nome: $ctrl.novoConsentimento.nome,
			tipo: $ctrl.novoConsentimento.tipo || "allow",
			propositos: $ctrl.novoConsentimento.propositos,
			tabela: $ctrl.novoConsentimento.tabela,
			colunas: $ctrl.novoConsentimento.colunas,
			condicao: $ctrl.novoConsentimento.condicao
		})

		$ctrl.novoConsentimento = { nome: "", tipo: "allow", propositos: [], tabela: "", colunas: [], condicao: "" };
		$ctrl.mostrarFormularioConsentimento = false;
		atualizarConsentimentos();
	};

	$ctrl.removerConsentimento = function (name) {
		consentLogic.removeConsentment(name);
		atualizarConsentimentos();
	};

	//role
	$ctrl.cargos = consentLogic.getRoles();
	$ctrl.visualizarCodigoCargos = false;
	$ctrl.codigoCargos = consentLogic.getRolesText();
	$ctrl.usuarioTemporario = '';
	$ctrl.novoCargo = {
		nome: '',
		consentimentos: [],
		usuarios: []
	};
	$ctrl.mostrarFormularioCargo = false;

	function atualizarCargos() {
		$ctrl.roles = consentLogic.getRoles();
		$ctrl.codigoCargos = consentLogic.getRolesText();
	};

	$ctrl.removerCargo = function (nome) {
		consentLogic.removeRole(nome);
		atualizarCargos();
	};

	$ctrl.toggleConsentimentoCargo = function (consentimentoNome) {
		const index = $ctrl.novoCargo.consentimentos.indexOf(consentimentoNome);
		if (index === -1) {
			$ctrl.novoCargo.consentimentos.push(consentimentoNome);
		} else {
			$ctrl.novoCargo.consentimentos.splice(index, 1);
		}
	};

	$ctrl.adicionarUsuarioAoCargo = function () {
		if ($ctrl.usuarioTemporario) {
			$ctrl.novoCargo.usuarios.push($ctrl.usuarioTemporario);
			$ctrl.usuarioTemporario = '';
		}
	};

	$ctrl.removerUsuarioDoCargo = function (index) {
		$ctrl.novoCargo.usuarios.splice(index, 1);
	};

	$ctrl.cancelarNovoCargo = function () {
		$ctrl.mostrarFormularioCargo = false;
		$ctrl.novoCargo = {
			nome: '',
			consentimentos: [],
			usuarios: []
		};
		$ctrl.usuarioTemporario = '';
		atualizarCargos();
	};

	$ctrl.confirmarNovoCargo = function () {
		if (!$ctrl.novoCargo.nome) {
			alert('Nome do cargo é obrigatório.');
			return;
		}

		consentLogic.addRole({
			nome: $ctrl.novoCargo.nome,
			consentimentos: $ctrl.novoCargo.consentimentos,
			usuarios: $ctrl.novoCargo.usuarios
		})
		$ctrl.cancelarNovoCargo();
	};
};

export default angular.module("app.sidebarControl", [])
	.component("sidebarControlLogical", {
		template: template,
		bindings: {
			selected: "<",
			showFeedback: "<",
		},
		controller: Controller,
	}).name;
