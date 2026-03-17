<template>
  <div class="layers-view">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="4">
        <el-input
          v-model="searchQuery"
          placeholder="Search layers..."
          prefix-icon="el-icon-search"
          clearable
          @change="handleSearch"
        ></el-input>
      </el-col>
      <el-col :span="3">
        <el-select v-model="filterLayerType" placeholder="Layer Type" clearable @change="handleSearch">
          <el-option label="Cad Layer" value="cad"></el-option>
          <el-option label="Derived Layer" value="derived"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="filterRing" placeholder="Ring" clearable @change="handleSearch">
          <el-option label="Yes" value="yes"></el-option>
          <el-option label="No" value="no"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddLayer">Add</el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="warning" icon="el-icon-upload2" @click="handleImportClick">Import</el-button>
        <input type="file" ref="importFile" style="display:none" @change="handleFileSelected" accept=".txt">
      </el-col>
      <el-col :span="3">
        <el-button type="info" icon="el-icon-refresh" @click="loadLayers">Refresh</el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="success" icon="el-icon-download" @click="handleExport">Export</el-button>
      </el-col>
    </el-row>

    <el-table
      :data="layers"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="layer_name" label="Layer Name" width="200"></el-table-column>
      <el-table-column prop="layer_lop" label="Layer LOP" min-width="200"></el-table-column>
      <el-table-column prop="layer_type" label="Layer Type" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.layer_type === 'cad' ? 'primary' : 'success'" size="mini">
            {{ scope.row.layer_type === 'cad' ? 'Cad Layer' : 'Derived Layer' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ring" label="Ring" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.ring === 'yes' ? 'warning' : 'info'" size="mini">
            {{ scope.row.ring === 'yes' ? 'Yes' : 'No' }}
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
      <el-form :model="layerForm" label-width="140px">
        <el-form-item label="Layer Name">
          <el-input v-model="layerForm.layer_name"></el-input>
        </el-form-item>
        <el-form-item label="Layer LOP">
          <el-input v-model="layerForm.layer_lop" type="textarea" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="Layer Type">
          <el-select v-model="layerForm.layer_type">
            <el-option label="Cad Layer" value="cad"></el-option>
            <el-option label="Derived Layer" value="derived"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Ring">
          <el-select v-model="layerForm.ring">
            <el-option label="Yes" value="yes"></el-option>
            <el-option label="No" value="no"></el-option>
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
  name: 'LayersView',
  data() {
    return {
      layers: [],
      loading: false,
      searchQuery: '',
      filterLayerType: '',
      filterRing: '',
      dialogVisible: false,
      dialogTitle: 'Add Layer',
      layerForm: {
        id: null,
        layer_name: '',
        layer_lop: '',
        layer_type: 'cad',
        ring: 'no'
      }
    };
  },
  methods: {
    loadLayers() {
      this.loading = true;
      const params = {};
      if (this.searchQuery) {
        params.search = this.searchQuery;
      }
      if (this.filterLayerType) {
        params.layer_type = this.filterLayerType;
      }
      if (this.filterRing) {
        params.ring = this.filterRing;
      }
      api.getLayers(params).then(data => {
        this.layers = data.results || data;
        this.loading = false;
      }).catch(err => {
        console.error('Failed to load layers:', err);
        this.loading = false;
        this.$message.error('Failed to load layers');
      });
    },
    handleSearch() {
      this.loadLayers();
    },
    handleAddLayer() {
      this.layerForm = {
        id: null,
        layer_name: '',
        layer_lop: '',
        layer_type: 'cad',
        ring: 'no'
      };
      this.dialogTitle = 'Add Layer';
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.layerForm = { ...row };
      this.dialogTitle = 'Edit Layer';
      this.dialogVisible = true;
    },
    handleSave() {
      if (!this.layerForm.layer_name || !this.layerForm.layer_lop) {
        this.$message.warning('Please fill in all fields');
        return;
      }

      const data = {
        layer_name: this.layerForm.layer_name,
        layer_lop: this.layerForm.layer_lop,
        layer_type: this.layerForm.layer_type,
        ring: this.layerForm.ring
      };

      if (this.layerForm.id) {
        api.updateLayer(this.layerForm.id, data).then(() => {
          this.$message.success('Layer updated successfully');
          this.dialogVisible = false;
          this.loadLayers();
        }).catch(err => {
          this.$message.error('Failed to update layer');
        });
      } else {
        api.createLayer(data).then(() => {
          this.$message.success('Layer created successfully');
          this.dialogVisible = false;
          this.loadLayers();
        }).catch(err => {
          this.$message.error('Failed to create layer');
        });
      }
    },
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this layer?', 'Confirm Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        api.deleteLayer(row.id).then(() => {
          this.$message.success('Layer deleted successfully');
          this.loadLayers();
        }).catch(err => {
          this.$message.error('Failed to delete layer');
        });
      });
    },
    handleExport() {
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8000';
      window.open(`${apiUrl}/api/layers/export/`, '_blank');
    },
    handleImportClick() {
      this.$refs.importFile.click();
    },
    handleFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      api.importLayers(file).then(result => {
        let msg = `Created: ${result.created}, Updated: ${result.updated || 0}, Skipped: ${result.skipped || 0}`;
        this.$message.success(msg);
        if (result.errors && result.errors.length > 0) {
          this.$message.warning(`${result.errors.length} errors: ${result.errors.slice(0, 3).join(', ')}`);
        }
        this.loadLayers();
      }).catch(err => {
        this.$message.error('Failed to import layers');
      });
      
      event.target.value = '';
    }
  },
  mounted() {
    this.loadLayers();
  }
};
</script>

<style scoped>
.layers-view {
  height: 100%;
}
</style>
