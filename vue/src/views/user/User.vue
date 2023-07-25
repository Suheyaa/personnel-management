<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
              v-model="deptName"
              placeholder="请输入部门名称"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
              class="filter-tree"
              :data="deptOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              ref="tree"
              node-key="id"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
          />
        </div>
      </el-col>

      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
                v-model="queryParams.userName"
                placeholder="请输入用户名称"
                clearable
                style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input
                v-model="queryParams.phone"
                placeholder="请输入手机号码"
                clearable
                style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
                v-model="queryParams.status"
                placeholder="用户状态"
                clearable
                style="width: 240px"
            >
              <el-option label="正常" value="1"></el-option>
              <el-option label="停用" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
                v-model="dateRange"
                style="width: 240px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="info"
                plain
                icon="el-icon-upload2"
                size="mini"
                @click="handleImport"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
            >导出</el-button>
          </el-col>
        </el-row>


        <el-table  :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
              label="序号"
              type="index"
              width="50">
          </el-table-column>
          <el-table-column label="用户名称" align="center" key="userName" prop="userName"  :show-overflow-tooltip="true" />
          <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" key="phone" prop="phone"  width="120" />
          <el-table-column label="状态" align="center" key="status" prop="status">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.status"
                  active-value="1"
                  inactive-value="0"
                  @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime"  width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              align="center"
              width="160"
              class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.id !== 1">
              <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <Pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.pageIndex"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
        />
        </el-col>
      </el-row>

      <!-- 添加或修改用户配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="form.nickName" placeholder="长度必须介于 2 和 20 之间" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="归属部门" prop="deptId">
                <treeselect v-model="form.deptId" :normalizer="tenantIdnormalizer" :options="deptOptions" :show-count="true" placeholder="请选择归属部门" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item v-if="form.id == undefined" label="用户名称" prop="userName">
                <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="form.id == undefined" label="用户密码" prop="password">
                <el-input v-model="form.password" placeholder="长度必须介于 5 和 20 之间" type="password" maxlength="20" show-password/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="用户性别">
                <el-select v-model="form.sex" placeholder="请选择性别" :formatter="sexformatter">
                  <el-option
                  v-for="item in sexList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio :label="1">正常</el-radio>
                  <el-radio :label="0">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="岗位">
                <el-select v-model="form.postId" multiple placeholder="请选择岗位">
                  <el-option
                      v-for="item in postOptions"
                      :key="item.id"
                      :label="item.postName"
                      :value="item.id"
                      :disabled="item.status == 1"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色">
                <el-select v-model="form.roleId" multiple placeholder="请选择角色">
                  <el-option
                      v-for="item in roleOptions"
                      :key="item.id"
                      :label="item.roleName"
                      :value="item.id"
                      :disabled="item.status == 1"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>

        <!-- 用户导入对话框 -->
        <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
          <el-upload
              ref="upload"
              :limit="1"
              accept=".xlsx, .xls"
              :headers="upload.headers"
              :action="upload.url"
              :disabled="upload.isUploading"
              :on-progress="handleFileUploadProgress"
              :on-success="handleFileSuccess"
              :auto-upload="false"
              drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
<!--              <div class="el-upload__tip" slot="tip">-->
<!--                <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据-->
<!--              </div>-->
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
            </div>
          </el-upload>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitFileForm">确 定</el-button>
            <el-button @click="upload.open = false">取 消</el-button>
          </div>
        </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import Pagination from "@/components/Pagination/index";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  components: {Pagination,Treeselect},
  created() {
    this.getList();
    this.getDeptTree();
  },
  watch: {
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  data() {
    return {
      // 遮罩层
      loading: false,

      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表单参数
      form: {},
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: "",

      deptName:undefined,
      deptOptions: undefined,
          // [
      //     {
      //   id: 1,
      //   label: '一级 1',
      //   children: [{
      //     id: 4,
      //     label: '二级 1-1',
      //     children: [{
      //       id: 9,
      //       label: '三级 1-1-1'
      //     }, {
      //       id: 10,
      //       label: '三级 1-1-2'
      //     }]
      //   }]
      // }, {
      //   id: 2,
      //   label: '一级 2',
      //   children: [{
      //     id: 5,
      //     label: '二级 2-1'
      //   }, {
      //     id: 6,
      //     label: '二级 2-2'
      //   }]
      // }, {
      //   id: 105,
      //   label: '测试部门',
      //   children: [{
      //     id: 7,
      //     label: '二级 3-1'
      //   }, {
      //     id: 8,
      //     label: '二级 3-2'
      //   }]
      // }
      // ],
      defaultProps: {
        children: 'children',
        label: 'deptName'
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        userName: undefined,
        phone: undefined,
        status: undefined,
        deptId: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      //修改状态参数
      statusParams:{
        status: undefined,
        id:undefined
      },
      // 显示搜索条件
      showSearch: true,
      // 总条数  初始为0
      total:0,
      // 日期范围
      dateRange: [],
      // 用户表格数据
      userList: [
        // {
        //   deptId: 103,
        //   email: "ry@163.com",
        //   createTime: "2023-04-23 16:11:38",
        //   id: 2,
        //   userName: "admin",
        //   sex: "1",
        //   status: "1",
        //   remark: "管理员",
        //   phone: "15888888888",
        //   password: null,
        //   nickName: "若依",
        //   dept: {
        //     deptId: 103,
        //     deptName: "研发部门",
        //     leader: "若依"
        //   },
        // },
      ],
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        // updateSupport: 0,
        // 设置上传的请求头部
        // headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASEURL + "/user/import"
      },
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      sexList:[
        {
          label:"男",
          value:1
        },
        {
          label:"女",
          value:2
        },
        {
          label:"未知",
          value:0
        },
      ],
      urls:{
        getUserList:'/user/search',
        changeUserStatus:'/user/status-change',
        delete: '/user/delete',
        getPostsAndRoles:'/user/choose',
        addUser:'/user/add',
        updateUser: '/user/update',
        exportExcel: '/user/export',
        downloadTemplate: '/user/downloadtemplate',
        importExcel:'/user/import',
        getDeptTree:"/user/userTree",
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      }

    }
  },
  methods:{
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      let param =this.addDateRange(this.queryParams, this.dateRange);
      axios({
        method:"post",
        data:param,
        url:this.urls.getUserList
      }).then(res => {
            this.userList = res.data.data.list;
            this.total = parseInt(res.data.data.total);
            this.userList.forEach((item,index)=>{
              item.status=item.status+""
            });
          }
      );
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            this.open = false;
            this.updateUser(this.form);
          } else {
            this.open = false;
            this.addUser(this.form);
          }
        }
      });
    },
    getDeptTree(){
      axios({
        url:this.urls.getDeptTree,
        method:"GET",
      }).then(res=>{
        if(res.data.status==0){
            this.deptOptions=res.data.data;
        }
      }).catch(res=>{
        this.$message.error(res.data.msg);
      })
    },
    //updateUser
    updateUser(data){
      axios({
        method:"post",
        data:data,
        url:this.urls.updateUser
      }).then(res=>{
        if(res.data.data===1){
          this.$message.success("修改成功");
          this.open = false;
          this.getList();
        }else {
          this.$message.info(res.data.msg);
        }
      }).catch(res=>{
        this.$message.error(res.data.msg);
      })
    },

    addUser(data){
      axios({
        method:"post",
        data:data,
        url:this.urls.addUser
      }).then(res=>{
        if(res.data.data===1){
          this.$message.success("新增成功");
          this.open = false;
          this.getList();
        }else {
          this.$message.info(res.data.msg);
        }
      }).catch(res=>{
        this.$message.error(res.data.msg);
      })

    },
    tenantIdnormalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.deptName,
        children: node.children
      }
    },

// 选择图标
    selected(name) {
      this.form.icon = name;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    addDateRange(params, dateRange){
      let search = params;
      search.createTimeStart=dateRange[0];
      search.createTimeEnd=dateRange[1];
      return search;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.deptName.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.deptId =undefined;
      this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    resetForm(refName){
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },

    sexformatter(row, column) {
      return row.sex === 1? "1" : "0";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      axios({
        method: "post",
        url:this.urls.getPostsAndRoles,
        data:{
          id:row.id
        },
      }).then(res=>{
        if(res.data.status===0)
        this.form=res.data.data;
        //读取map
        this.postOptions=res.data.data.postRole["post"];
        this.roleOptions=res.data.data.postRole["role"];
        this.$set(this.form, "postId", res.data.data.postId);
        this.$set(this.form, "roleId", res.data.data.roleId);
        this.open = true;
        this.title = "修改用户";
      }).catch((res)=>{
        this.$message.error(res.data.msg)
      })




      // this.form = {
      //   deptId: 6,
      //   email: "ry@163.com",
      //   createTime: "2023-04-23 16:11:38",
      //   id: 2,
      //   userName: "admin",
      //   sex: "1",
      //   status: 1,
      //   remark: "管理员",
      //   phone: "15888888888",
      //   password: null,
      //   nickName: "若依",
      // };
      // this.postOptions=[
      //   {
      //     postName: "董事长",
      //     status: "0",
      //     postId: 1
      //   },
      //   {
      //     postName: "项目经理",
      //     status: "0",
      //     postId: 2
      //   },
      //   {
      //     postName: "人力资源",
      //     postId: 3,
      //     status: "0"
      //   }
      // ];
      // this.roleOptions=[
      //   {
      //     roleId: 2,
      //     roleName: "普通角色",
      //     status: "0"
      //   }
      // ];

      // this.form = response.data;
      // this.postOptions = response.posts;
      // this.roleOptions = response.roles;
      // this.$set(this.form, "postIds", response.postIds);
      // this.$set(this.form, "roleIds", response.roleIds);
    },


    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      axios({
        method: "post",
        url:this.urls.getPostsAndRoles
      }).then(res=>{
        this.open = true;
        this.title = "添加用户";
        if(res.data.status===0){
          //读取map
          this.postOptions=res.data.data.postRole["post"];
          this.roleOptions=res.data.data.postRole["role"];
        }
      }).catch((res)=>{
        if(res.data.status!=0){
          this.$message.error(res.data.msg);
        }
      })
      //     [
      //   {
      //     postName: "董事长",
      //     status: "0",
      //     postId: 1
      //   },
      //   {
      //     postName: "项目经理",
      //     status: "0",
      //     postId: 2
      //   },
      //   {
      //     postName: "人力资源",
      //     postId: 3,
      //     status: "0"
      //   }
      // ];
      // [
      //   {
      //     roleId: 2,
      //     roleName: "普通角色",
      //     status: "0"
      //   }
      // ];
      //   this.postOptions = response.data.data.posts;
      //   this.roleOptions = response.data.data.roles;
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        sex: undefined,
        status: 1,
        remark: undefined,
        postId: [],
        roleId: []
      };
      this.resetForm("form");
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },


    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.id || this.ids;
      this.$confirm('是否删除选中的所有用户?删除后无法恢复!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios({
          url: this.urls.delete,
          method: 'post',
          data:{
            ids:userIds
          }
        }).then(res=>{
          if(res.data.data===0){
            this.getList();
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }else{
            this.$message({
              type: 'error',
              message: res.data.msg
            });
          }
        }).catch(res=>{
          this.$message.error(res.data.msg);
        })
      }).catch(() => {});
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "1" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.userName + '"用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.statusParams.id=row.id;
        this.statusParams.status=row.status;
        axios({
          method:"post",
          url:this.urls.changeUserStatus,
          data:this.statusParams
        }).then(res=>{
          this.statusParams.id=undefined;
          this.statusParams.status=undefined;
          if(res.data.status===0){
            this.$message({
              type: 'success',
              message: text+'成功!'
            });
          }else {
            row.status = row.status === "0" ? "1" : "0";
            this.$message({
              type: 'error',
              message: res.data.data.msg
            });
          }
        }).catch((res) => {
          this.$message.error(res.data.msg)
        })
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },

    /** 下载模板操作 */
    importTemplate() {
     axios({
        url: this.urls.downloadTemplate,
        method:"post",
       responseType: 'blob',
      }).then(res=>{
       const blob = new Blob([res.data], {
         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
       });
       const a = document.createElement("a");
       const href = window.URL.createObjectURL(blob);
       a.href = href;
       a.download = '用户表模板.xlsx';
       a.style.display='none';
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(href);
       document.body.removeChild(a);
        this.$message.success("下载模板成功");
      }).catch(res=>{
        this.$message.success(res.data.msg);
      })
    },


    /** 导出按钮操作 */
    handleExport() {
       axios({
         url: this.urls.exportExcel,
         method:"post",
         responseType: 'blob',
       }).then(res=>{
         const blob = new Blob([res.data], {
           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
         });
         const a = document.createElement("a");
         const href = window.URL.createObjectURL(blob);
         a.href = href;
         // a.download = '';
         a.style.display='none';
         a.setAttribute('download','用户表.xlsx')
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(href);
         document.body.removeChild(a);
         this.$message.success("导出成功");
       }).catch(res=>{
         this.$message.success(res.data.msg);
       })
    },

    // 转换字符串，undefined,null等转化为""
    parseStrEmpty(str) {
      if (!str || str == "undefined" || str == "null") {
        return "";
      }
      return str;
    },


    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.data + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },

    parseTime(time, pattern) {
      if (arguments.length === 0 || !time) {
        return null
      }
      const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
      let date
      if (typeof time === 'object') {
        date = time
      } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
          time = parseInt(time)
        } else if (typeof time === 'string') {
          time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm), '');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
          time = time * 1000
        }
        date = new Date(time)
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      }
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
          value = '0' + value
        }
        return value || 0
      })
      return time_str
    },

  }
}
</script>

<style>
.app-container {
  padding: 20px;
}

</style>