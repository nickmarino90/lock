import Immutable, { List, Map } from 'immutable';
import { dataFns } from '../../utils/data_utils';

const { initNS, get } = dataFns(["client"]);

const DEFAULT_CONNECTION_VALIDATION = { username: { min: 1, max: 15 } };

function formatConnectionValidation (connectionValidation = {}) {
  if (connectionValidation.username == null) {
    return null;
  }

  const validation = { ...DEFAULT_CONNECTION_VALIDATION, ...connectionValidation };
  const defaultMin = DEFAULT_CONNECTION_VALIDATION.username.min;
  const defaultMax = DEFAULT_CONNECTION_VALIDATION.username.max;

  validation.username.min = parseInt(validation.username.min, 10) || defaultMin;
  validation.username.max = parseInt(validation.username.max, 10) || defaultMax;

  if (validation.username.min > validation.username.max) {
    validation.username.min = defaultMin;
    validation.username.max = defaultMax;
  }

  return validation;
}

const emptyConnections = Immutable.fromJS({
  database: [],
  enterprise: [],
  passwordless: [],
  social: [],
  unknown: [] // TODO: should be oauth2
});

export function initTenant(m, client_id, client) {
  return initNS(m, formatTenant(client_id, client));
}

function formatTenant(client_id, o) {
  return new Immutable.fromJS({
    connections: formatTenantConnections(client_id, o)
  })
}

function formatTenantConnections(client_id, o) {
  const result = emptyConnections.toJS();
  const connectionTypes = Object.keys(o.connections);
  var connections_filter = null;

  if (o.clients_connections && o.clients_connections[client_id]) {
    connections_filter = o.clients_connections[client_id];
  }
  
  connectionTypes.forEach( connectionTypeName => {

    const connections = o.connections[connectionTypeName].map(connection => {
      return formatTenantConnection(connectionTypeName, connection);
    }).filter(connection => connections_filter === null || connections_filter.indexOf(connection.name) !== -1);
    result[connectionTypeName].push(...connections);
  })

  return result;
}

function formatTenantConnection(connectionType, connection) {
  const result = {
    name: connection.name,
    strategy: connection.strategy,
    type: connectionType
  };

  if (connectionType === "database") {
    result.passwordPolicy = connection.passwordPolicy || "none";
    result.allowSignup = typeof connection.showSignup === "boolean"
      ? connection.showSignup
      : true;
    result.allowForgot = typeof connection.showForgot === "boolean"
      ? connection.showForgot
      : true;
    result.requireUsername = typeof connection.requires_username === "boolean"
      ? connection.requires_username
      : false;
    result.validation = formatConnectionValidation(connection.validation);
  }

  if (connectionType === "enterprise") {
    result.domains = connection.domains;
  }

  return result;
}

export function tenantConnections(m) {
  return get(m, "connections", emptyConnections);
}
