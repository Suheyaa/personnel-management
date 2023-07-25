<template>
  <!--与若依相比修改的地方：
  所有的parentId 修改成 superiorId
  所有的 deptId 修改成 id
  所有的 status 修改成 deptStatus
-->
  <div class="app-container">
<!--    头部搜索区-->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
            v-model="queryParams.deptName"
            placeholder="请输入部门名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>


      <el-form-item label="状态" prop="deptStatus">
        <el-select v-model="queryParams.deptStatus" placeholder="请选择状态">
          <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>



      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>




<!--  展开折叠、搜索区-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:dept:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="el-icon-sort"
            size="mini"
            @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    表格数据区-->
    <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="deptList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="部门名称" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
      <el-table-column prop="deptStatus" label="状态" width="100">
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-tag type="success" effect="dark" v-if="scope.row.deptStatus==1">正常</el-tag>
          <el-tag type="warning" effect="dark" v-if="scope.row.deptStatus==0">停用</el-tag>
        </template>

      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:dept:edit']"
          >修改</el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-plus"
              @click="handleAdd(scope.row)"
              v-hasPermi="['system:dept:add']"
          >新增</el-button>
          <el-button
              v-if="scope.row.superiorId != 0"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:dept:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.superiorId !== 0">

            <el-form-item label="上级部门" prop="superiorId">
<!--              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />-->
              <el-input v-model="form.superiorId" placeholder="请输入上级部门id" />
            </el-form-item>

          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

<!--        负责人信息只做显示，不可修改-->
        <el-row>
<!--          <el-col :span="12">-->
<!--            <el-form-item label="负责人id" prop="leader">-->
<!--              <el-input v-model="form.leaderId" placeholder="请输入负责人id" maxlength="20" :disabled="true" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
          <el-col :span="12">
            <el-form-item label="负责人姓名" prop="leader">
              <el-input v-model="form.userName" placeholder="请输入负责人姓名" maxlength="20" :disabled="true" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" :disabled="true"/>
            </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="部门状态" prop="email">
              <el-input v-model="form.deptStatus" placeholder="请输入部门状态" maxlength="50" :disabled="true"/>
            </el-form-item>
          </el-col>

          <el-form-item label="状态" prop="deptStatus">
            <el-select v-model="form.deptStatus" placeholder="请选择状态">
              <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

<!--          <el-col :span="12">-->
<!--            <el-form-item label="部门状态">-->

<!--              <el-switch-->
<!--                  v-model="form.deptStatus"-->
<!--                  active-value="1"-->
<!--                  inactive-value="0"-->
<!--                  active-color="#13ce66"-->
<!--                  inactive-color="#ff4949">-->
<!--              </el-switch>-->

<!--                <el-radio  v-model="form.deptStatus" label="1" >正常</el-radio>-->
<!--                <el-radio  v-model="form.deptStatus" label="0" >停用</el-radio>-->


<!--            </el-form-item>-->
<!--          </el-col>-->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import axios from 'axios'

export default {
  name: "Dept",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {



      urls:{
        listDept:'/dept/list',// 查询部门列表
        // listDept:'/dept/getDeptTree',// 查询部门列表
        addDept:'/dept/insert', // 新增部门
        delDept: '/dept/delete/',// 删除部门
        updateDept:'/dept/update',// 修改部门
        selectDeptById:'/dept/selectDeptById',// 根据id查询

        getDept:'/system/dept/',// 查询部门详细



        listDeptExcludeChild:'/user/add', // 查询部门列表（排除节点）



      },

      statusOptions:[
        {
          value: '0',
          label: '停用'
        },
        {
        value: '1',
        label: '正常'
        },
      ],



      //区分提交按钮：有提交id 就是修改，没有就是添加，因为修改需要id，添加不需要id
      submitId: undefined,
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [


      ],
      // 部门树选项
      deptOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        deptName: undefined,
        deptStatus: undefined,
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        // parentId: [
        superiorId: [
          { required: true, message: "上级部门不能为空", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        // email: [
        //   {
        //     type: "email",
        //     message: "请输入正确的邮箱地址",
        //     trigger: ["blur", "change"]
        //   }
        // ],
        // phone: [
        //   {
        //     pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        //     message: "请输入正确的手机号码",
        //     trigger: "blur"
        //   }
        // ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {



    /** 查询部门列表 */
    getList() {
      axios({
        method:"get",
        url:this.urls.listDept,
        params: {
          deptName : this.queryParams.deptName,
          deptStatus : this.queryParams.deptStatus,
        }
      }).then(res => {
            // this.userList = res.data.rows;
            // this.total = res.data.total;
        this.deptList = res.data.data;
          }
      );
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        // id: node.deptId,
        id: node.id,
        label: node.deptName,
        children: node.children
      };
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      //添加、修改 框数据清空
      this.form = {
        // deptId: undefined,
        // parentId: undefined,
        id: undefined,
        superiorId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        deptStatus: undefined,
      };
      // this.resetForm("form");
      //搜索框 数据清空
      this.queryParams  = {
        deptName: undefined,
        deptStatus: ' ',

      };

    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams  = {
        deptName: undefined,
        deptStatus: undefined,

      };
      this.handleQuery();//执行搜索方法
    },
    /** 新增 添加 按钮操作 */
    handleAdd(row) {
      this.reset();//表单重置
      //将 提交按钮 存的id清空了
      this.submitId = undefined
      if (row != undefined) {
        // this.form.parentId = row.deptId;
        this.form.superiorId = row.id;
      }
      this.open = true;
      this.title = "添加部门";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      // this.reset();
      this.submitId = row.id;
      //先拿着部门id去查询出来这条数据，并连带这将他的负责人信息查询出来，再把数据赋给form
      axios({
        method:"get",
        url:this.urls.selectDeptById,
        params: {
          id : row.id,
        }
      }).then(res => {
        //查询成功后复制给 修改弹框
        this.form = res.data.data;

          }
      );

        this.open = true;
        this.title = "修改部门";


    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.submitId != undefined) {//是修改，不是添加

            axios({
              method:"post",
              url:this.urls.updateDept,
              data: {
                id:this.submitId,
                deptName:this.form.deptName,
                leaderId:this.form.leaderId,
                // 修改的状态怎么 单选框？
                deptStatus:this.form.deptStatus,
                superiorId:this.form.superiorId,
                ancestors:this.form.ancestors,
                orderNum:this.form.orderNum,

              }
            }).then(res => {
                  this.$message({
                    type: 'success',
                    message: '修改成功!'
                  });
                  this.open = false;
                  this.getList();
                }
            );

          } else {//添加


            axios({
              method:"post",
              url:this.urls.addDept,
              data: {
                deptName:this.form.deptName,
                //负责人id???直接从查询的数据中取
                leaderId:this.form.leaderId,
                deptStatus:this.form.deptStatus,
                superiorId:this.form.superiorId,
                ancestors:this.form.ancestors,
                orderNum:this.form.orderNum,
              }
            }).then(res => {
              this.$message({
                type: 'success',
                message: '添加成功!'
              });
              this.open = false;
              this.getList();
                }
            );

          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {

      this.$confirm('是否删除选中的所有部门？删除后无法恢复!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios({
          method:"get",
          url:this.urls.delDept,
          params: {
            id : row.id,
          }
        }).then(res => {
          if(res.data.deptStatus===0){
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
            }
        );

      }).catch(() => {});


    },
    //时间解析
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
};
</script>
