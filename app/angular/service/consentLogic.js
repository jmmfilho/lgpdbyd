// consentLogic.js

const consent = {
    purposes: [],
    textPupose : "",
    consentment: [],
    textConsentment : "",
    roles: [],
    textRoles: "",
  };

  // Funções públicas
  function getPurposes() {
    return consent.purposes;
  }
  function getPurposesText() {
    return consent.textPupose;
  }
  
  function addPurpose(purpose) {
    consent.purposes.push(purpose);
    consent.textPupose = exportPurposesAsCode();
  }
  
  function removePurpose(name) {
    const index = consent.purposes.findIndex(p => p.name === name);
    if (index !== -1) {
      consent.purposes.splice(index, 1);
    }
    consent.textPupose = exportPurposesAsCode();
  }
  
  function exportPurposesAsCode() {
    return consent.purposes.map(p => {
      let line = `CREATE PURPOSE ${p.name}`;
      
      if (p.parent) {
        line += ` PARENT = ${p.parent}`;
      }
  
      if (p.comment) {
        line += ` COMMENT = "${p.comment}"`;
      }
  
      return line + ';';
    }).join('\n');
  }

  //novas
  function exportConsentmentAsCode() {
    if (!Array.isArray(consent.consentment)) return '';
  
    return consent.consentment.map(c => {
      const tipo = c.tipo?.toUpperCase?.() || 'ALLOW';
      const propositos = Array.isArray(c.propositos) && c.propositos.length > 0
        ? c.propositos.join(', ')
        : '*';
  
      const tabela = c.tabela || '*';
      const colunas = Array.isArray(c.colunas) && c.colunas.length > 0
        ? `(${c.colunas.join(', ')})`
        : '';
  
      const condicao = c.condicao ? ` WHERE ${c.condicao}` : '';
  
      return `CREATE CONSENT POLICY ${c.nome}\nAS ${tipo} PURPOSE ${propositos}\nTO ${tabela} ${colunas}${condicao};`;
    }).join('\n\n');
  }

  function getConsentment() {
    return consent.consentment;
  }

  function getConsentmentText(){
    return consent.textConsentment;
  }
  function addConsentment(consentment) {
    consent.consentment.push(consentment);
    consent.textConsentment = exportConsentmentAsCode();
  }

  function removeConsentment(name) {
    const index = consent.consentment.findIndex(p => p.nome === name);
    if (index !== -1) {
      consent.consentment.splice(index, 1);
    }
    consent.textConsentment = exportConsentmentAsCode();
  }

  //cargos
  function getRoles(){
    return consent.roles;
  }

  function exportRolesAsCode() {
    if (!Array.isArray(consent.roles)) return '';

    return consent.roles.map(c => {
      const nome = c.nome;
      const consentimentos = c.consentimentos.join(', ');
      const usuarios = c.usuarios.join(', ');

      return `GRANT PURPOSE ${consentimentos} TO ROLE ${nome}\nGRANT ${usuarios} TO ${nome}`;
    }).join('\n\n');
  }
  
  function getRolesText(){
    return consent.textRoles;
  }
  function addRole(role) {
    consent.roles.push(role);
    consent.textRoles = exportRolesAsCode();
  }

  function removeRole(name) {
    const index = consent.roles.findIndex(p => p.nome === name);
    if (index !== -1) {
      consent.roles.splice(index, 1);
    }
    consent.textRoles = exportRolesAsCode();
  }


  function allConsentText() {
    return (consent.textPupose + "\n\n"+consent.textConsentment + "\n\n"+consent.textRoles)
  }

  module.exports = {
    getPurposes,
    getPurposesText,
    addPurpose,
    removePurpose,

    getConsentment,
    getConsentmentText,
    addConsentment,
    removeConsentment,

    getRoles,
    getRolesText,
    addRole,
    removeRole,

    allConsentText
  };
  