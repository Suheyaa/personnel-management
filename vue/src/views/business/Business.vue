<template>
  <div class="app-container">
    <el-row>
      <el-form :inline="true" :model="searchForm" ref="searchForm" class="demo-form-inline">
        <el-form-item label="系统名称" prop="businessName">
          <el-input v-model.trim="searchForm.businessName" placeholder="系统名称" clearable/>
        </el-form-item>
        <el-form-item label="系统状态" prop="status">
          <el-select v-model="searchForm.status" clearable placeholder="请选择">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查 询</el-button>
          <el-button @click="resetSearchForm">重 置</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
    </el-row>

    <el-table
        stripe
        v-if="refreshTable"
        v-loading="loading"
        :data="menuList"
        row-key="menuId"
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
        style="padding-top:20px">
      <el-table-column prop="businessName" label="系统名称"
                       :show-overflow-tooltip="true" align="center" sortable/>
      <el-table-column prop="icon" label="图标" align="center">
        <template slot-scope="scope">
          <i :class="scope.row.icon"/>
        </template>
      </el-table-column>
      <el-table-column prop="permission" label="权限字符"
                       :show-overflow-tooltip="true" align="center" sortable/>
      <el-table-column prop="path" label="路由地址"
                       :show-overflow-tooltip="true" align="center" sortable/>
      <el-table-column prop="status" label="状态" align="center" sortable>
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1">正常</el-tag>
          <el-tag type="danger" v-if="scope.row.status === 0">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" sortable/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row.id)"
          >修改
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row.id)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="padding-top:20px">
      <el-pagination :current-page="currentPage" :page-size="pageSize" background
                     @current-change="handleCurrentChange" :total="totalCount"
                     layout="prev, pager, next"/>
    </div>

    <!-- 添加或修改系统对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body
               v-if="refresh" :show-close="showClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="系统图标" prop="icon">
              <el-popover
                  placement="bottom-start"
                  width="460"
                  trigger="click"
                  @show="$refs['iconSelect'].reset()"
              >
                <span class="clear-icon">
                  <i @click="clearIcon" class="el-icon-delete"/>
                </span>
                <select-icon ref="iconSelect" @selected="selected" :active-icon="form.icon"/>
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                  <template slot="prepend">
                    <i v-if="form.icon" slot="prefix" :class="form.icon"/>
                    <i v-else slot="prefix" class="el-icon-search"/>
                  </template>
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统名称" prop="businessName">
              <el-input v-model="form.businessName" placeholder="请输入系统名称" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                <i class="el-icon-question"/>
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model="form.path" placeholder="请输入路由地址" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="permission">
              <el-input v-model="form.permission" placeholder="请输入权限标识" maxlength="100" clearable/>
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                            placement="top">
                <i class="el-icon-question"/>
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="status">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                <i class="el-icon-question"/>
                </el-tooltip>
                系统状态
              </span>
              <template>
                <el-radio v-model="form.status" :label="1">正常</el-radio>
                <el-radio v-model="form.status" :label="0">停用</el-radio>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import selectIcon from '@/components/IconSelect.vue';
import axios from 'axios'
import VueAxios from "vue-axios";
import Vue from "vue";

Vue.use(VueAxios, axios)

export default {
  created() {
    this.getList();
  },
  components: {
    selectIcon
  },
  data() {
    return {
      input: '',
      // 查询参数
      searchForm: {
        businessName: '',
        status: ''
      },
      //当前页码
      currentPage: 1,
      // 总条数，根据接口获取数据长度(注意：这里不能为空)
      totalCount: 1,
      //页面数据显示数量
      pageSize: 10,
      options: [{
        value: '1',
        label: '正常'
      }, {
        value: '0',
        label: '停用'
      }],
      showClose: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      id: undefined,
      menuList: [],
      refresh: false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      radio: '1',
      // 表单校验
      rules: {
        businessName: [
          {required: true, message: "系统名称不能为空", trigger: "blur"}
        ],
        permission: [
          {required: true, message: "权限字符不能为空", trigger: "blur"}
        ],
        path: [
          {required: true, message: "路由地址不能为空", trigger: "blur"}
        ]
      },
      urls: {
        getCounts: "/business/getCounts",
        search: "/business/list",
        delete: "/business/delete",
        select: "/business/selectById",
        insert: "/business/insert",
        update: "/business/update"
      },
    }
  },

  methods: {
    reset() {
      this.form = {
        id: undefined,
        icon: undefined,
        businessName: undefined,
        path: undefined,
        permission: undefined,
        status: 1
      };
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList();
    },
    /** 选择图标 */
    selected(name) {
      this.form.icon = name;
    },
    clearIcon() {
      // 清空图标的逻辑，将图标重置为默认值或null
      this.form.icon = null;
    },
    /** 查询系统列表 */
    getList() {
      //分页查询
      this.loading = true;
      axios({
        method: "GET",
        url: this.urls.getCounts,
        data: {}
      }).then((res) => {
        if (res.status === 200) {
          this.totalCount = res.data.data;
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          });
        }
      }).catch((error) => {
        console.log(error);
        this.loading = false;
        this.$message.error("服务器异常，请稍后再试");
      })
      let url = this.urls.search + "/" + this.currentPage + "/" + this.pageSize;
      axios({
        method: "POST",
        url: url,
        data: this.searchForm
      }).then((res) => {
        if (res.status === 200) {
          this.loading = false;
          this.menuList = res.data.data;
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          });
        }
      }).catch((error) => {
        console.log(error);
        this.loading = false;
        this.$message.error("服务器异常，请稍后再试");
      });
    },
    /** 查询按钮操作 */
    onSearch() {
      this.getList();
    },
    resetSearchForm() {
      //重置表单数据
      this.searchForm = this.$options.data().searchForm;
      this.value = this.$options.data().value;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.refresh = true;
      this.reset();
      this.open = true;
      this.title = "添加系统";
    },
    /** 修改按钮操作 */
    handleUpdate(id) {
      this.id = id;
      let url = this.urls.select + "/" + id;
      this.axios({
        method: "GET",
        url: url
      }).then((res) => {
        let code = res.status;
        if (code === 200) {
          this.refresh = true;
          this.reset();
          this.title = "修改系统";
          this.form = res.data.data;
          this.open = true;
        }
      }).catch((error) => {
        console.log(error)
      });
    },
    /** 删除按钮操作 */
    handleDelete(id) {
      this.$confirm("确认删除该系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let url = this.urls.delete + "/" + id;
        this.axios({
          method: "POST",
          url: url
        }).then((res) => {
          let code = res.status;
          if (code === 200) {
            this.$message({
              type: "success",
              message: "删除成功"
            });
            this.getList();
          } else {
            this.$message({
              type: "error",
              message: res.data.msg
            });
          }
        }).catch((error) => {
          console.log(error)
        });
      }).catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.refresh = false;
      this.reset();
      this.$message({
        type: 'info',
        message: '已取消操作'
      });
    },
    /** 提交按钮 */
    submitForm() {
      //提交新增或者修改的数据
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let url = this.urls.insert;
          if (this.id != null) {
            url = this.urls.update;
          }
          this.axios({
            method: "POST",
            url: url,
            data: this.form
          }).then((res) => {
            console.log(res);
            let code = res.status;
            if (code === 200) {
              this.open = false;
              this.refresh = false;
              this.$message({
                type: 'success',
                message: '操作成功！'
              });
              this.getList();
            } else {
              this.$message({
                type: 'error',
                message: res.data.msg
              });
            }
          }).catch((error) => {
            console.log(error);
            this.$message.error("服务器异常，请稍后再试");
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>
