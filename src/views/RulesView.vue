<template>
  <div class="rules-view">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="4">
        <el-card shadow="hover" style="text-align: center">
          <div style="font-size: 24px; font-weight: bold; color: #409EFF">{{ totalRules }}</div>
          <div style="color: #909399; font-size: 12px">Total Rules</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" style="text-align: center">
          <div style="font-size: 24px; font-weight: bold; color: #67C23A">{{ optimizedCount }}</div>
          <div style="color: #909399; font-size: 12px">Optimized</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" style="text-align: center">
          <div style="font-size: 24px; font-weight: bold; #909399">{{ totalRules - optimizedCount - matchedCount }}</div>
          <div style="color: #909399; font-size: 12px">Need Optimization</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" style="text-align: center">
          <div style="font-size: 24px; font-weight: bold; color: #E6A23C">{{ matchedCount }}</div>
          <div style="color: #909399; font-size: 12px">Template Matched</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-input
          v-model="searchQuery"
          placeholder="Search rules..."
          prefix-icon="el-icon-search"
          clearable
          @change="handleSearch"
        ></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddRule">Add Rule</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" icon="el-icon-download" @click="handleExport">Export</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="warning" icon="el-icon-upload2" @click="handleImportClick">Import</el-button>
        <input type="file" ref="importFile" style="display:none" @change="handleFileSelected" accept=".txt">
      </el-col>
      <el-col :span="2">
        <el-button type="info" icon="el-icon-refresh" @click="loadRules">Refresh</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 15px">
      <el-col :span="6">
        <el-select v-model="filterRuleType" placeholder="Filter by Type" clearable @change="handleFilter">
          <el-option label="Extension" value="Extension"></el-option>
          <el-option label="Spacing" value="Spacing"></el-option>
          <el-option label="Width" value="Width"></el-option>
          <el-option label="Area" value="Area"></el-option>
          <el-option label="Other" value="Other"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="filterDevice" placeholder="Filter by Device" clearable @change="handleFilter">
          <el-option label="MOS3" value="MOS3"></el-option>
          <el-option label="MOS4" value="MOS4"></el-option>
          <el-option label="LOGIC" value="LOGIC"></el-option>
          <el-option label="NMOS" value="NMOS"></el-option>
          <el-option label="PMOS" value="PMOS"></el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-table
      :data="rules"
      border
      stripe
      height="500"
      v-loading="loading"
      @row-click="handleRowClick"
      style="width: 100%"
    >
      <el-table-column prop="rule_name" label="Rule Name" width="180" fixed></el-table-column>
      <el-table-column prop="description" label="Description" min-width="200"></el-table-column>
      <el-table-column label="Status" width="120" fixed="right">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.description_opt_status === 'Done'" type="success" size="small">Done</el-tag>
          <el-tag v-else type="primary" size="small">On-Going</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="constraint" label="Constraint" width="100">
        <template slot-scope="scope">
          <el-tag size="mini">{{ scope.row.constraint }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="value" label="Value" width="80"></el-table-column>
      <el-table-column prop="device_name" label="Device" width="100"></el-table-column>
      <el-table-column prop="rule_type" label="Type" width="120">
        <template slot-scope="scope">
          <el-tag :type="getTypeTagType(scope.row.rule_type)" size="mini">{{ scope.row.rule_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" @click.stop="handleEdit(scope.row)"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click.stop="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalRules"
      style="margin-top: 20px; text-align: right"
    ></el-pagination>

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="50%"
    >
      <div style="padding: 20px" v-if="selectedRule">
        <el-form :model="selectedRule" label-width="140px">
          <el-form-item label="Rule Name">
            <el-input v-model="selectedRule.rule_name" :disabled="isEditing"></el-input>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="selectedRule.description" type="textarea" rows="3" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="Description Opt">
            <el-input v-model="selectedRule.description_opt" type="textarea" rows="2"></el-input>
          </el-form-item>
          <el-form-item label="Status">
            <el-select v-model="selectedRule.description_opt_status">
              <el-option label="Done" value="Done"></el-option>
              <el-option label="On-Going" value="On-Going"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Template">
            <el-select
              v-model="selectedTemplateId"
              filterable
              allow-create
              default-first-option
              placeholder="Select or create template"
              @change="handleTemplateChange"
              style="width: 100%"
            >
              <el-option
                v-for="t in recommendedTemplates"
                :key="t.id"
                :label="t.template_content.substring(0, 50) + (t.template_content.length > 50 ? '...' : '')"
                :value="t.id"
              >
                <span>{{ t.template_content.substring(0, 50) }}</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Score: {{ t.similarity }}%</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Final Template">
            <el-input v-model="finalTemplateContent" type="textarea" rows="3" @input="handleFinalTemplateChange"></el-input>
          </el-form-item>
          <el-form-item label="Extracted">
            <el-input v-model="extractedContent" type="textarea" rows="2" placeholder="Extracted layer content"></el-input>
          </el-form-item>
          <el-form-item label="Unextracted">
            <el-input v-model="unextractedContent" type="textarea" rows="2" placeholder="Unextracted content"></el-input>
          </el-form-item>
          <el-form-item label="Layer List">
            <el-input v-model="layerListString" type="textarea" rows="2" placeholder="Auto-extracted layer list from template"></el-input>
            <el-button size="mini" type="success" @click="handleDefineLayer" style="margin-top: 5px">Define New Layer</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">Save</el-button>
            <el-button @click="handleCancel">Cancel</el-button>
            <el-button type="warning" icon="el-icon-thumb" @click="handleAISuggest">AI Suggest</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-dialog title="Define New Layer" :visible.sync="layerDialogVisible" width="400px">
      <el-form>
        <el-form-item label="Layer Name">
          <el-input v-model="newLayerName" placeholder="e.g., LAYER1"></el-input>
        </el-form-item>
        <el-form-item label="Layer LOP">
          <el-input v-model="newLayerLop" placeholder="e.g., LAYER1"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="layerDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreateLayer">Create</el-button>
      </span>
    </el-dialog>

    <el-drawer
      title="AI Suggestions"
      :visible.sync="aiDrawerVisible"
      direction="ltr"
      size="30%"
    >
      <div style="padding: 20px">
        <el-alert
          title="AI Suggestions"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        ></el-alert>
        <div v-if="aiSuggestions.length === 0" style="text-align: center; color: #999">
          No suggestions available. Click "AI Suggest" to generate.
        </div>
        <el-card v-for="suggestion in aiSuggestions" :key="suggestion.id" style="margin-bottom: 10px">
          <div slot="header" style="display: flex; justify-content: space-between; align-items: center">
            <el-tag size="mini" :type="getSuggestionTagType(suggestion.suggestion_type)">
              {{ getSuggestionTypeLabel(suggestion.suggestion_type) }}
            </el-tag>
            <el-button v-if="suggestion.suggestion_type === 'extracted'" size="mini" type="success" @click="applyExtractedSuggestion(suggestion)">Use Template</el-button>
            <el-button v-else size="mini" type="primary" @click="applySuggestion(suggestion)">Apply</el-button>
          </div>
          <div>{{ suggestion.suggestion_content }}</div>
          <div v-if="suggestion.suggestion_type === 'extracted'" style="margin-top: 10px; font-size: 12px; color: #666">
            <div><strong>Extracted Layers:</strong> {{ (suggestion.extracted_layers || []).join(', ') }}</div>
            <div><strong>Description Extra:</strong> {{ (suggestion.extracted_description_extra || []).join(', ') }}</div>
            <div><strong>Template Extra:</strong> {{ (suggestion.extracted_template_extra || []).join(', ') }}</div>
          </div>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'RulesView',
  data() {
    return {
      rules: [],
      loading: false,
      searchQuery: '',
      filterRuleType: '',
      filterDevice: '',
      currentPage: 1,
      pageSize: 50,
      totalRules: 0,
      optimizedCount: 0,
      matchedCount: 0,
      drawerVisible: false,
      drawerTitle: 'Rule Detail',
      selectedRule: null,
      isEditing: false,
      layerListString: '',
      aiDrawerVisible: false,
      aiSuggestions: [],
      selectedTemplateId: null,
      recommendedTemplates: [],
      allTemplates: [],
      finalTemplateContent: '',
      extractedContent: '',
      unextractedContent: [],
      layerDialogVisible: false,
      newLayerName: '',
      newLayerLop: ''
    };
  },
  computed: {
    currentRuleDescription() {
      if (!this.selectedRule) return '';
      return this.selectedRule.description || this.selectedRule.description_opt || '';
    }
  },
  watch: {
    finalTemplateContent(newVal) {
      if (newVal) {
        const ruleDesc = this.currentRuleDescription;
        this.extractContentFromTemplate(newVal, ruleDesc);
      } else {
        this.extractedContent = '';
        this.unextractedContent = '';
      }
    },
    'selectedRule.description'(newVal) {
      if (this.finalTemplateContent && newVal) {
        this.extractContentFromTemplate(this.finalTemplateContent, newVal);
      }
    },
    'selectedRule.description_opt'(newVal) {
      if (this.finalTemplateContent && newVal) {
        this.extractContentFromTemplate(this.finalTemplateContent, newVal);
      }
    }
  },
  methods: {
    loadRules() {
      this.loading = true;
      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        search: this.searchQuery,
        rule_type: this.filterRuleType,
        device_name: this.filterDevice
      };
      
      api.getRules(params).then(data => {
        this.rules = data.results || data;
        this.totalRules = data.count || data.length;
        
        api.getRules({ page_size: 1000 }).then(allData => {
          const allRules = allData.results || allData;
          this.calculateStatistics(allRules);
        });
        
        this.loading = false;
      }).catch(err => {
        console.error('Failed to load rules:', err);
        this.loading = false;
        this.$message.error('Failed to load rules');
      });
    },
    calculateStatistics(rules) {
      api.getTemplates({}).then(templates => {
        const allTemplates = templates.results || templates;
        
        let optimized = 0;
        let matched = 0;
        
        rules.forEach(rule => {
          const descOpt = rule.description_opt || '';
          const desc = rule.description || '';
          
          if (descOpt && desc && descOpt !== desc) {
            optimized++;
          }
          
          if (rule.description_template_final) {
            const template = allTemplates.find(t => t.id === rule.description_template_final);
            if (template) {
              const normalizedDesc = (rule.description || '').toLowerCase().replace(/\s+/g, '');
              const normalizedTemplate = template.template_content.toLowerCase().replace(/\$\{[^}]+\}|\$<[^>]+>/g, '').replace(/\s+/g, '');
              
              if (normalizedDesc === normalizedTemplate) {
                matched++;
              }
            }
          }
        });
        
        this.optimizedCount = optimized;
        this.matchedCount = matched;
      });
    },
    handleSearch() {
      this.currentPage = 1;
      this.loadRules();
    },
    handleFilter() {
      this.currentPage = 1;
      this.loadRules();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadRules();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadRules();
    },
    handleRowClick(row) {
      this.selectedRule = { ...row };
      this.layerListString = JSON.stringify(row.layer_list || []);
      this.drawerTitle = 'Rule Detail';
      this.drawerVisible = true;
      this.isEditing = false;
      this.loadAISuggestions();
    },
    handleAddRule() {
      this.selectedRule = {
        rule_name: '',
        description: '',
        description_opt: '',
        constraint: '>=',
        value: 0,
        device_name: '',
        rule_type: 'Extension',
        layer_list: []
      };
      this.layerListString = '[]';
      this.drawerTitle = 'Add New Rule';
      this.drawerVisible = true;
      this.isEditing = false;
      this.aiSuggestions = [];
    },
    handleEdit(row) {
      this.selectedRule = { ...row };
      const layerList = row.layer_list || [];
      this.layerListString = Array.isArray(layerList) ? JSON.stringify(layerList) : layerList;
      this.drawerTitle = 'Edit Rule';
      this.drawerVisible = true;
      this.isEditing = true;
      this.selectedTemplateId = row.description_template_final || row.description_template_final_id || null;
      this.finalTemplateContent = '';
      this.extractedContent = '';
      this.unextractedContent = '';
      this.loadTemplatesAndCalculateSimilarity();
      this.loadAISuggestions();
    },
    handleAddRule() {
      this.selectedRule = {
        rule_name: '',
        description: '',
        description_opt: '',
        constraint: '>=',
        value: 0,
        device_name: '',
        rule_type: 'Extension',
        layer_list: []
      };
      this.layerListString = '[]';
      this.selectedTemplateId = null;
      this.finalTemplateContent = '';
      this.extractedContent = '';
      this.unextractedContent = '';
      this.recommendedTemplates = [];
      this.drawerTitle = 'Add Rule';
      this.drawerVisible = true;
      this.isEditing = false;
      this.loadTemplatesAndCalculateSimilarity();
    },
    handleSave() {
      try {
        this.selectedRule.layer_list = JSON.parse(this.layerListString);
      } catch (e) {
        this.$message.error('Invalid layer list format');
        return;
      }

      const ruleData = { ...this.selectedRule };
      if (this.selectedTemplateId) {
        ruleData.description_template_final = this.selectedTemplateId;
      }

      if (this.selectedRule.id) {
        api.updateRule(this.selectedRule.id, ruleData).then(() => {
          this.$message.success('Rule updated successfully');
          this.drawerVisible = false;
          this.loadRules();
        }).catch(err => {
          this.$message.error('Failed to update rule');
        });
      } else {
        api.createRule(ruleData).then(() => {
          this.$message.success('Rule created successfully');
          this.drawerVisible = false;
          this.loadRules();
        }).catch(err => {
          this.$message.error('Failed to create rule');
        });
      }
    },
    handleCancel() {
      this.drawerVisible = false;
    },
    handleDelete(row) {
      this.$confirm('Are you sure you want to delete this rule?', 'Confirm Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        api.deleteRule(row.id).then(() => {
          this.$message.success('Rule deleted successfully');
          this.loadRules();
        }).catch(err => {
          this.$message.error('Failed to delete rule');
        });
      });
    },
    handleExport() {
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8000';
      window.open(`${apiUrl}/api/rules/export/`, '_blank');
    },
    handleImportClick() {
      this.$refs.importFile.click();
    },
    handleFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      api.importRules(file).then(result => {
        let msg = `Created: ${result.created}, Updated: ${result.updated || 0}, Skipped: ${result.skipped || 0}`;
        this.$message.success(msg);
        if (result.errors && result.errors.length > 0) {
          this.$message.warning(`${result.errors.length} errors: ${result.errors.slice(0, 3).join(', ')}`);
        }
        this.loadRules();
      }).catch(err => {
        this.$message.error('Failed to import rules');
      });
      
      event.target.value = '';
    },
    handleAISuggest() {
      if (!this.selectedRule || !this.selectedRule.id) {
        this.$message.warning('Please save the rule first before getting AI suggestions');
        return;
      }
      this.loadAISuggestions();
      this.aiDrawerVisible = true;
    },
    handleDefineLayer() {
      this.newLayerName = '';
      this.newLayerLop = '';
      this.layerDialogVisible = true;
    },
    handleCreateLayer() {
      if (!this.newLayerName) {
        this.$message.warning('Please enter layer name');
        return;
      }
      
      const layerLop = this.newLayerLop || this.newLayerName;
      
      api.createLayer({
        layer_name: this.newLayerName,
        layer_lop: layerLop,
        layer_type: 'cad',
        ring: 'no'
      }).then(() => {
        this.$message.success('Layer created successfully');
        this.layerDialogVisible = false;
        
        if (this.selectedRule) {
          const descOpt = this.selectedRule.description_opt || '';
          const updatedDescOpt = this.replaceWordInString(descOpt, layerLop, this.newLayerName);
          this.selectedRule.description_opt = updatedDescOpt;
        }
        
        this.replaceLopInAllRules(layerLop, this.newLayerName);
      }).catch(err => {
        this.$message.error('Failed to create layer');
      });
    },
    replaceWordInString(str, oldWord, newWord) {
      if (!str || !oldWord) return str;
      let result = str;
      result = result.replace(new RegExp(`^${oldWord}\\s+`, 'g'), `${newWord} `);
      result = result.replace(new RegExp(`\\s+${oldWord}$`, 'g'), ` ${newWord}`);
      result = result.replace(new RegExp(`\\s+${oldWord}\\s+`, 'g'), ` ${newWord} `);
      return result;
    },
    replaceLopInAllRules(oldLop, newName) {
      console.log('replaceLopInAllRules called:', oldLop, newName);
      api.getRules({ page_size: 1000 }).then(data => {
        const rules = data.results || data;
        console.log('Total rules:', rules.length);
        const rulesToUpdate = rules.filter(rule => 
          rule.description_opt && rule.description_opt.includes(oldLop)
        );
        console.log('Rules to update:', rulesToUpdate.length, rulesToUpdate.map(r => r.rule_name));
        
        if (rulesToUpdate.length === 0) {
          console.log('No rules found with:', oldLop);
          return;
        }
        
        let updatedCount = 0;
        rulesToUpdate.forEach(rule => {
          const updatedDescOpt = this.replaceWordInString(
            rule.description_opt,
            oldLop,
            newName
          );
          console.log('Updating rule:', rule.rule_name, 'from:', rule.description_opt, 'to:', updatedDescOpt);
          
          if (updatedDescOpt !== rule.description_opt) {
            api.updateRule(rule.id, {
              ...rule,
              description_opt: updatedDescOpt
            }).then(() => {
              updatedCount++;
            }).catch(err => {
              console.error('Failed to update rule:', rule.id, err);
            });
          }
        });
        
        setTimeout(() => {
          this.$message.success(`Updated ${updatedCount} rules with ${oldLop} -> ${newName}`);
          this.loadRules();
        }, 1000);
      }).catch(err => {
        console.error('Error in replaceLopInAllRules:', err);
      });
    },
    loadAISuggestions() {
      if (!this.selectedRule || !this.selectedRule.id) return;
      
      api.getAISuggestions(this.selectedRule.id).then(data => {
        this.aiSuggestions = data.suggestions || [];
      }).catch(err => {
        console.error('Failed to get AI suggestions:', err);
      });
    },
    calculateSimilarity(str1, str2) {
      if (!str1 || !str2) return 0;
      const s1 = str1.toLowerCase().replace(/\s+/g, '');
      const s2 = str2.toLowerCase().replace(/\s+/g, '');
      if (s1 === s2) return 100;
      
      const longer = s1.length > s2.length ? s1 : s2;
      const shorter = s1.length > s2.length ? s2 : s1;
      if (longer.length === 0) return 100;
      
      const editDistance = this.getEditDistance(shorter, longer);
      return Math.round((1 - editDistance / longer.length) * 100);
    },
    getEditDistance(s1, s2) {
      const m = s1.length;
      const n = s2.length;
      const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
      
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (s1[i-1] === s2[j-1]) {
            dp[i][j] = dp[i-1][j-1];
          } else {
            dp[i][j] = Math.min(dp[i-1][j-1] + 1, dp[i][j-1] + 1, dp[i-1][j] + 1);
          }
        }
      }
      return dp[m][n];
    },
    loadTemplatesAndCalculateSimilarity() {
      api.getTemplates({}).then(data => {
        const templates = data.results || data;
        this.allTemplates = templates;
        
        if (!this.selectedRule || !this.selectedRule.description) {
          this.recommendedTemplates = templates.slice(0, 5).map(t => ({
            ...t,
            similarity: 0
          }));
          return;
        }
        
        const ruleDesc = this.selectedRule.description || this.selectedRule.description_opt || '';
        
        const scored = templates.map(t => ({
          ...t,
          similarity: this.calculateSimilarity(ruleDesc, t.template_content)
        }));
        
        scored.sort((a, b) => b.similarity - a.similarity);
        
        const highMatch = scored.filter(t => t.similarity >= 80);
        if (highMatch.length > 0) {
          this.recommendedTemplates = highMatch;
        } else {
          this.recommendedTemplates = scored.slice(0, 5);
        }
        
        if (this.selectedRule.description_template_final) {
          this.selectedTemplateId = this.selectedRule.description_template_final;
          const template = templates.find(t => t.id === this.selectedRule.description_template_final);
          if (template) {
            this.finalTemplateContent = template.template_content;
            this.extractContentFromTemplate(template.template_content, ruleDesc);
          }
        } else if (this.recommendedTemplates.length > 0) {
          this.selectedTemplateId = this.recommendedTemplates[0].id;
          this.finalTemplateContent = this.recommendedTemplates[0].template_content;
          this.extractContentFromTemplate(this.recommendedTemplates[0].template_content, ruleDesc);
        }
      }).catch(err => {
        console.error('Failed to load templates:', err);
      });
    },
    extractContentFromTemplate(templateContent, ruleDescription) {
      const layerPattern = /\$\{[^}]+\}|\$<[^>]+>/g;
      const layers = templateContent.match(layerPattern) || [];
      
      if (layers.length === 0) {
        this.extractedContent = '';
        this.unextractedContent = `Description: ${ruleDescription} | Template: ${templateContent}`;
        this.layerListString = '[]';
        return;
      }
      
      const extracted = [];
      const extractedRegex = [];
      
      let templateParts = [];
      let lastIndex = 0;
      let match;
      const regex = /\$\{[^}]+\}|\$<[^>]+>/g;
      
      while ((match = regex.exec(templateContent)) !== null) {
        if (match.index > lastIndex) {
          templateParts.push({ type: 'text', value: templateContent.substring(lastIndex, match.index) });
        }
        templateParts.push({ type: 'layer', value: match[0] });
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < templateContent.length) {
        templateParts.push({ type: 'text', value: templateContent.substring(lastIndex) });
      }
      
      let ruleRemain = ruleDescription;
      const descriptionParts = ruleRemain.split(/\s+/).filter(s => s);
      
      let descIndex = 0;
      
      for (let i = 0; i < templateParts.length; i++) {
        const part = templateParts[i];
        
        if (part.type === 'text') {
          const textWords = part.value.trim().split(/\s+/).filter(s => s);
          for (let j = 0; j < textWords.length; j++) {
            if (descIndex < descriptionParts.length && descriptionParts[descIndex] === textWords[j]) {
              descIndex++;
            }
          }
        } else if (part.type === 'layer') {
          if (descIndex < descriptionParts.length) {
            const layerValue = descriptionParts[descIndex];
            extracted.push(layerValue);
            extractedRegex.push(`$<${layerValue}>`);
            descIndex++;
          }
        }
      }
      
      const remainingRule = descriptionParts.slice(descIndex).join(' ');
      
      this.extractedContent = extracted.join(', ');
      this.unextractedContent = `Description: ${remainingRule} | Template: `;
      
      this.layerListString = JSON.stringify(extractedRegex);
    },
    handleFinalTemplateChange() {
      const ruleDesc = this.selectedRule.description || this.selectedRule.description_opt || '';
      this.extractContentFromTemplate(this.finalTemplateContent, ruleDesc);
    },
    handleTemplateChange(value) {
      if (!value) return;
      
      const isNewTemplate = typeof value === 'string' && !this.allTemplates.some(t => t.id === value);
      if (isNewTemplate) {
        api.createTemplate({
          template_name: `PAT_GEN_MAP_${Date.now()}`,
          template_content: value,
          pattern_status: 'ready'
        }).then(newTemplate => {
          this.selectedTemplateId = newTemplate.id;
          this.selectedRule.description_template_final = newTemplate.id;
          this.finalTemplateContent = value;
          const ruleDesc = this.selectedRule.description || this.selectedRule.description_opt || '';
          this.extractContentFromTemplate(value, ruleDesc);
          this.loadTemplatesAndCalculateSimilarity();
          this.$message.success('New template created');
        }).catch(err => {
          this.$message.error('Failed to create template');
        });
      } else {
        this.selectedRule.description_template_final = value;
        const template = this.allTemplates.find(t => t.id === value);
        if (template) {
          this.finalTemplateContent = template.template_content;
          const ruleDesc = this.selectedRule.description || this.selectedRule.description_opt || '';
          this.extractContentFromTemplate(template.template_content, ruleDesc);
        }
      }
    },
    applySuggestion(suggestion) {
      api.applyAISuggestion(suggestion.id).then(data => {
        this.$message.success('Suggestion applied successfully');
        if (data.rule) {
          this.selectedRule = { ...data.rule, ...this.selectedRule };
          this.layerListString = JSON.stringify(data.rule.layer_list || []);
        }
        this.loadRules();
        this.loadAISuggestions();
      }).catch(err => {
        this.$message.error('Failed to apply suggestion');
      });
    },
    applyExtractedSuggestion(suggestion) {
      if (suggestion.extracted_layers && suggestion.extracted_layers.length > 0) {
        this.selectedRule.layer_list = suggestion.extracted_layers;
        this.layerListString = JSON.stringify(suggestion.extracted_layers);
      }
      
      const templateContent = suggestion.suggestion_content.replace('Template: ', '');
      const template = this.allTemplates.find(t => t.template_content === templateContent);
      
      if (template) {
        this.selectedTemplateId = template.id;
        this.finalTemplateContent = templateContent;
        const ruleDesc = this.selectedRule.description || this.selectedRule.description_opt || '';
        this.extractContentFromTemplate(templateContent, ruleDesc);
      }
      
      this.selectedRule.description_template_final = template ? template.id : null;
      
      this.$message.success('Template applied successfully');
    },
    getTypeTagType(type) {
      const types = {
        'Extension': 'primary',
        'Spacing': 'success',
        'Width': 'warning',
        'Area': 'info',
        'Other': ''
      };
      return types[type] || '';
    },
    getSuggestionTagType(type) {
      const types = {
        'description': 'primary',
        'constraint': 'warning',
        'value': 'danger',
        'naming': 'info',
        'template': 'success',
        'extracted': 'warning'
      };
      return types[type] || '';
    },
    getSuggestionTypeLabel(type) {
      const labels = {
        'description': 'Description',
        'constraint': 'Constraint',
        'value': 'Value',
        'naming': 'Naming',
        'template': 'Template',
        'extracted': 'Extracted'
      };
      return labels[type] || type;
    }
  },
  mounted() {
    this.loadRules();
  }
};
</script>

<style scoped>
.rules-view {
  height: 100%;
}
</style>
