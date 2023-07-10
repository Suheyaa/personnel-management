<template>
  <div>
    <el-row class="search-container">
      <el-col :span="6">
        <el-form :inline="true" class="search-form">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.roleName"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form :inline="true" class="search-form">
          <el-form-item label="权限字符">
            <el-input v-model="searchForm.permission"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form :inline="true" class="search-form">
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择">
              <el-option label="启用" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <el-form :inline="true" class="search-form">
          <el-form-item label="创建时间">
            <el-date-picker
                v-model="searchForm.createTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12" class="button-container">
        <el-form :inline="true" class="search-form">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!--按钮区域-->
    <el-button type="primary" @click="handleCreate">创建角色</el-button>
    <el-button type="danger" @click="handleDeleteSelected" :disabled="selectedRoles.length === 0">删除选中</el-button>
    <el-button type="primary" @click="handleExport" class="export-button">导出</el-button>
    <!--表格区域-->
    <el-table :data="filteredRoles" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column label="序号" >
        <template scope="scope">
          <span>{{(currentPage-1)*pageSize+(scope.$index + 1)}} </span>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="角色编号" v-if="false"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="permission" label="权限字符"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" active-text="启用"
                     inactive-text="禁用" @change="handleSwitchChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页区域-->
    <el-pagination
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <!--表单区域-->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="30%">
      <el-form ref="form" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName"></el-input>
        </el-form-item>
        <el-form-item label="权限字符" prop="permission">
          <el-input v-model="form.permission"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务系统" prop="businesses">
          <el-select v-model="form.businesses" multiple placeholder="请选择业务系统">
            <el-option v-for="business in businesses" :key="business.businessId" :label="business.businessName" :value="business.businessId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      filteredRoles: [],
      searchForm: {
        roleName: '',
        permission: '',
        status: '',
        createTime: '',
      },
      selectedRoles: [],
      businesses: [
        {businessId: 1, businessName: '推送系统', createTime: '2023-01-01'},
        {businessId: 2, businessName: '电商系统', createTime: '2023-01-01'},
      ],
      businessIds:[],
      dialogVisible: false,
      dialogFlag: '',
      dialogTitle: '',
      form: {
        id: 0,
        roleName: '',
        permission: '',
        status: '1', // 默认设置为启用状态
        createTime: '',
        remark: '',
        businesses: [],
      },
      ids:[],
      formRules: {
        roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
        permission: [{required: true, message: '请输入权限字符', trigger: 'blur'}],
        businesses: [{required: false, message: '请选择业务系统', trigger: 'blur'}],
      },
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示数量
      total: 0, // 查询到的角色数量
      selectedBusinesses: [], // 选择的业务系统
      urls: {
        insert: "/role/insert",
        delete: "/role/delete",
        batchDelete: "/role/batch_deletion",
        update: "/role/update",
        pagingQuery: "/role/paging_query",
        export: "/export",
        changeStatus: "/role/change_status",
        businessList: "/business/list"
      }
    };
  },
  created:function () {
    // 初始化，配合后盾测试时打开
    this.pagingQuery();
    // this.businessList();

  },
  methods: {
    // 业务系统列表
    businessList() {
      axios({
        method: "get",
        url: this.urls.businessList
      }).then((res) => {
        this.businesses = res.data.data
      })
    },
    // 翻页
    handlePageChange(currentPage) {
      this.currentPage = currentPage;
      this.pagingQuery();
    },
    // 修改页面大小
    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.pagingQuery();
    },
    // 添加窗口
    handleCreate() {
      this.dialogVisible = true;
      this.dialogFlag = 'save';
      this.dialogTitle = '添加角色';
      // 清空表单数据
      this.form = {
        id: 0,
        roleName: '',
        permission: '',
        status: '1',
        createTime: '',
        remark: '',
        businesses: [],
      };
      this.selectedBusinesses = [];
    },
    // 编辑窗口
    handleEdit(row) {
      this.dialogVisible = true;
      this.dialogFlag = 'edit';
      this.dialogTitle = '编辑角色';
      // 设置表单数据
      this.form = {
        id: row.id,
        roleName: row.roleName,
        permission: row.permission,
        status: row.status,
        createTime: row.createTime,
        remark: row.remark,
        businesses: row.businesses.map((business) => business.businessId),
      };
      this.selectedBusinesses = this.form.businesses;
    },
    // 删除窗口
    handleDelete(row) {
      // 弹出确认删除的提示框
      this.$confirm('确定要删除该角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.bantchDelete(row)
      }).catch(() => {
        // 用户点击取消按钮
        this.$message.info('操作取消');
      });
    },
    // 批量删除窗口
    handleDeleteSelected() {
      if (this.selectedRoles.length > 0) {
        // 弹出确认删除的提示框
        this.$confirm('确定要删除选中的角色吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.bantchDelete(this.selectedRoles)
        }).catch(() => {
          // 用户点击取消按钮
          this.$message.info('操作取消');
        });
      }
    },
    // 批量删除
    bantchDelete(row) {
      if (row !== null){
        this.selectedRoles.push(row.id)
      }
      axios({
        method: "post",
        data: this.selectedRoles,
        url: this.urls.batchDelete
      }).then((res) => {
        if (res.data.status === 0){
          this.$message.success('删除成功');
          this.selectedRoles = [];
          this.pagingQuery();
        }else{
          this.$message.error('删除失败');
        }
      })
    },
    // 搜索按钮
    handleSearch() {
      this.pagingQuery();
    },
    // 条件查询
    pagingQuery() {
      let data = {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        roleName: this.searchForm.roleName,
        permission: this.searchForm.permission,
        status: this.searchForm.status,
        createTimeStart: this.searchForm.createTime[0],
        createTimeEnd: this.searchForm.createTime[1],
      }
      axios({
        method: "post",
        data: data,
        url: this.urls.pagingQuery
      }).then((res) => {
        this.filteredRoles = res.data.data.list;
        this.total = parseInt(res.data.data.total);
      }).catch(() => {
        this.$message.error('查询出错');
      });
    },
    // 重置搜索框
    handleReset() {
      // 处理重置搜索的逻辑
      this.searchForm = {
        roleName: '',
        permission: '',
        status: '',
        createTime: '',
      };
      this.handleSearch();
    },
    // 处理多选
    handleSelectionChange(selection) {
      this.selectedRoles = selection.map((item) => item.id)
    },
    // 修改状态
    handleSwitchChange(row) {
      axios({
        method: "get",
        url: this.urls.changeStatus+"?id="+row.id+"&status="+row.status
      }).then((res) => {
        if (res.data.success === true){
          this.$message.success('修改成功');
        }else{
          this.$message.error('修改失败');
        }
      })
    },
    // 导出
    handleExport() {
      axios({
        method: "post",
        data: this.filteredRoles,
        url: this.urls.export
      }).then((res) => {
        if (res.data.code === 200){
          this.$message.success('导出成功');
        }else{
          this.$message.error('导出失败');
        }
      })
    },
    // 添加或修改
    handleSave() {
      this.$refs.form.validate((valid) => {
        // 校验
        if (valid) {
          // 构造角色对象
          const role = {
            id: this.form.id,
            roleName: this.form.roleName,
            permission: this.form.permission,
            status: this.form.status,
            ids: this.form.businesses,
            remark: this.form.remark,
          };
          // 添加
          if (this.dialogFlag === 'save'){
            axios({
              method: "post",
              data: role,
              url: this.urls.insert
            }).then((res) => {
              if (res.data.status === 0){
                this.$message.success('添加成功');
                // 保存成功后关闭对话框
                this.dialogVisible = false;
                this.pagingQuery();
              }else{
                this.$message.error('添加失败');
              }
            })
          }
          // 修改
          if (this.dialogFlag === 'edit'){
            axios({
              method: "post",
              data: role,
              url: this.urls.update
            }).then((res) => {
              if (res.data.status === 0){
                this.$message.success('修改成功');
                // 保存成功后关闭对话框
                this.dialogVisible = false;
              }else{
                this.$message.error('修改失败');
              }
            })
          }
        }
      });
    },
  },
};
</script>

<style>
.search-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.search-form{
  margin-right: 20px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}
</style>
