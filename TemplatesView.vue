<template>
  <div class="templates-view">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-input
          v-model="searchQuery"
          placeholder="Search templates..."
          prefix-icon="el-icon-search"
          clearable
          @change="handleSearch"
        ></el-input>
      </el-col>
      <el-col :span="4">
        <el-select v-model="filterStatus" placeholder="Filter by Status" clearable @change="handleSearch">
          <el-option label="Ready" value="ready"></el-option>
          <el-option label="OnGoing" value="ongoing"></el-option>
          <el-option label="Issue" value="issue"></el-option>
          <el-option label="Unused" value="unused"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddTemplate">Add</el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="warning" icon="el-icon-upload2" @click="handleImportClick">Import</el-button>
        <input type="file" ref="importFile" style="display:none" @change="handleFileSelected" accept=".txt">
      </el-col>
      <el-col :span="3">
        <el-button type="info" icon="el-icon-refresh" @click="loadTemplates">Refresh</el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="success" icon="el-icon-download" @click="handleExport">Export</el-button>
      </el-col>
    </el-row>

    <el-table
      :data="templates"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="template_name" label="Template Name" min-width="180"></el-table-column>
      <el-table-column prop="template_content" label="Template Content" min-width="250"></el-table-column>
      <el-table-column prop="pattern_status" label="Pattern Status" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.pattern_status)" size="mini">
            {{ getStatusLabel(scope.row.pattern_status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="templateForm" label-width="140px">
        <el-form-item label="Template Content">
          <el-input v-model="templateForm.template_content" type="textarea" rows="4" @input="handleContentChange"></el-input>
        </el-form-item>
        <el-form-item label="Pattern Status">
          <el-select v-model="templateForm.pattern_status">
            <el-option label="Ready" value="ready"></el-option>
            <el-option label="OnGoing" value="ongoing"></el-option>
            <el-option label="Issue" value="issue"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSave">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'TemplatesView',
  data() {
    return {
      templates: [],
      filteredTemplates: [],
      loading: false,
      searchQuery: '',
      filterStatus: '',
      dialogVisible: false,
      dialogTitle: 'Add Template',
      templateForm: {
        id: null,
        template_name: '',
        template_content: '',
        pattern_status: 'ready'
      }
    };
  },
  methods: {
    loadTemplates() {
      this.loading = true;
      const params = {};
      if (this.searchQuery) {
        params.search = this.searchQuery;
      }
      if (this.filterStatus) {
        params.pattern_status = this.filterStatus;
      }
      api.getTemplates(params).then(data => {
        this.templates = data.results || data;
        this.loading = false;
      }).catch(err => {
        console.error('Failed to load templates:', err);
        this.loading = false;
        this.$message.error('Failed to load templates');
      });
    },
    handleSearch() {
      this.loadTemplates();
    },
    filterTemplates() {
      if (!this.searchQuery) {
        this.filteredTemplates = this.templates;
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredTemplates = this.templates.filter(t => 
          t.template_name.toLowerCase().includes(query) ||
          t.template_content.toLowerCase().includes(query)
        );
      }
    },
    handleContentChange() {
    },
    handleAddTemplate() {
      this.templateForm = {
        id: null,
        template_name: '',
        template_content: '',
        pattern_status: 'ready'
      };
      this.dialogTitle = 'Add Template';
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.templateForm = { ...row };
      this.dialogTitle = 'Edit Template';
      this.dialogVisible = true;
    },
    handleSave() {
      if (!this.templateForm.template_content) {
        this.$message.warning('Please fill in Template Content');
        return;
      }

      const data = {
        template_content: this.templateForm.template_content,
        pattern_status: this.templateForm.pattern_status
      };

      if (this.templateForm.id) {
        api.updateTemplate(this.templateForm.id, data).then(() => {
          this.$message.success('Template updated successfully');
          this.dialogVisible = false;
          this.loadTemplates();
        }).catch(err => {
          this.$message.error('Failed to update template');
        });
      } else {
        api.createTemplate(data).then(() => {
          this.$message.success('Template created successfully');
          this.dialogVisible = false;
          this.loadTemplates();
        }).catch(err => {
          this.$message.error('Failed to create template');
        });
      }
    },
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this template?', 'Confirm Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        api.deleteTemplate(row.id).then(() => {
          this.$message.success('Template deleted successfully');
          this.loadTemplates();
        }).catch(err => {
          this.$message.error('Failed to delete template');
        });
      });
    },
    handleExport() {
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8000';
      window.open(`${apiUrl}/api/templates/export/`, '_blank');
    },
    handleImportClick() {
      this.$refs.importFile.click();
    },
    handleFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      api.importTemplates(file).then(result => {
        let msg = `Created: ${result.created}, Updated: ${result.updated || 0}, Skipped: ${result.skipped || 0}`;
        this.$message.success(msg);
        if (result.errors && result.errors.length > 0) {
          this.$message.warning(`${result.errors.length} errors: ${result.errors.slice(0, 3).join(', ')}`);
        }
        this.loadTemplates();
      }).catch(err => {
        this.$message.error('Failed to import templates');
      });
      
      event.target.value = '';
    },
    getStatusTagType(status) {
      const types = {
        'ready': 'success',
        'ongoing': 'primary',
        'issue': 'danger'
      };
      return types[status] || 'info';
    },
    getStatusLabel(status) {
      const labels = {
        'ready': 'Ready',
        'ongoing': 'OnGoing',
        'issue': 'Issue'
      };
      return labels[status] || status;
    }
  },
  mounted() {
    this.loadTemplates();
  }
};
</script>

<style scoped>
.templates-view {
  height: 100%;
}
</style>
