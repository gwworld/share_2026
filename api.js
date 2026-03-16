const API_BASE_URL = '/api';

export default {
  async getRules(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/rules/?${queryString}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error - getRules:', error);
      throw error;
    }
  },

  async getRuleById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${id}/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - getRuleById:', error);
      throw error;
    }
  },

  async createRule(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - createRule:', error);
      throw error;
    }
  },

  async updateRule(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - updateRule:', error);
      throw error;
    }
  },

  async deleteRule(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('API Error - deleteRule:', error);
      throw error;
    }
  },

  async getTemplates(params = {}) {
    try {
      let url = `${API_BASE_URL}/templates/`;
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - getTemplates:', error);
      throw error;
    }
  },

  async createTemplate(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - createTemplate:', error);
      throw error;
    }
  },

  async updateTemplate(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - updateTemplate:', error);
      throw error;
    }
  },

  async deleteTemplate(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('API Error - deleteTemplate:', error);
      throw error;
    }
  },

  async importTemplates(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/templates/import_templates/`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - importTemplates:', error);
      throw error;
    }
  },

  async importLayers(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/layers/import_layers/`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - importLayers:', error);
      throw error;
    }
  },

  async importRules(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/rules/import_rules/`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - importRules:', error);
      throw error;
    }
  },

  async getLayers(params = {}) {
    try {
      let url = `${API_BASE_URL}/layers/`;
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - getLayers:', error);
      throw error;
    }
  },

  async createLayer(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/layers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - createLayer:', error);
      throw error;
    }
  },

  async updateLayer(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/layers/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - updateLayer:', error);
      throw error;
    }
  },

  async deleteLayer(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/layers/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('API Error - deleteLayer:', error);
      throw error;
    }
  },

  async getAISuggestions(ruleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}/ai_suggest/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - getAISuggestions:', error);
      throw error;
    }
  },

  async applyAISuggestion(suggestionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-suggestions/${suggestionId}/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error - applyAISuggestion:', error);
      throw error;
    }
  }
};
