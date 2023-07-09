<!--用户界面：查、删-->
<template>
  <div>
    <!--    搜索表单-->
    <div style="margin-bottom: 20px">
      <el-input style="width: 240px" placeholder="请输入岗位编码" v-model="params.post_code"></el-input>
      <el-input style="width: 240px; margin-left: 5px" placeholder="请输入岗位名称" v-model="params.post_name"></el-input>
      <el-input style="width: 240px; margin-left: 5px" placeholder="请输入岗位状态" v-model="params.status"></el-input>
      <el-button style="margin-left: 10px" type="primary" @click="load" ><i class="el-icon-search"></i> 搜索</el-button>
      <el-button style="margin-left: 10px" type="warning" @click="reset" ><i class="el-icon-refresh"></i> 重置</el-button>
    </div>

    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="add"  ><i class="el-icon-plus"></i>  添加 </el-button>
      <el-button style="margin-left: 10px" type="info"  ><i class="el-icon-edit"></i>  修改 </el-button>
      <el-button style="margin-left: 10px" type="danger"   ><i class="el-icon-delete"></i>  删除 </el-button>
      <el-button style="margin-left: 10px" type="warning"   ><i class="el-icon-download"></i>  导出 </el-button>
    </div>

    <el-table :data="tableData" stripe border >
      <el-table-column prop="dept_name" label="部门名称" ></el-table-column>
      <el-table-column prop="order_num" label="显示顺序" ></el-table-column>
      <el-table-column prop="dept_status" label="部门状态"></el-table-column>

      <el-table-column prop="create_time" label="创建时间" ></el-table-column>
      <el-table-column prop="update_time" label="更新时间"  ></el-table-column>

      <el-table-column label="操作"  width="300" fixed="right" ><!--fixed="right"：固定在右侧-->
        <template v-slot="scope">
          <!--编辑按钮-->
          <el-button type="primary" @click="updateUser(scope.row)"  icon="el-icon-edit" round   style="margin-left: 10px"></el-button>
          <!--删除按钮-->
          <el-popconfirm
              style="margin-left: 10px"
              title="您确定删除这行数据吗？"
              @confirm="del(scope.row.id)"
          >
            <el-button type="danger" slot="reference"  icon="el-icon-delete" round  ></el-button>
          </el-popconfirm>

          <!--添加按钮-->
          <el-button type="primary" @click="add2(scope.row)"  icon="el-icon-plus" round   style="margin-left: 10px"></el-button>

        </template>
      </el-table-column>
    </el-table>



    <!--分页-->
    <div style="margin-top: 20px">
      <el-pagination
          background
          :current-page="params.pageNum"
          :page-size="params.pageSize"
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
          :total="total">
      </el-pagination>
    </div>


    <!--添加按钮弹框：1-->
    <el-dialog title="添加部门" :visible.sync="dialogFormVisible1" width="30%"><!--dialogFormVisible1：控制这个弹框的显示-->
      <!--ruleForm1用于 修改弹框的表单验证，规则绑定的是 rules-->
      <el-form :model="form" label-width="100px" ref="ruleForm1" :rules="rules" style="width: 85%">
        <el-form-item label="部门名称" prop="dept_name">
          <el-input v-model="form.dept_name" placeholder="请输入岗位名称"></el-input>
        </el-form-item>
        <el-form-item label="负责人id" prop="name">
          <el-input v-model="form.name" placeholder="请输入岗位编码"></el-input>
        </el-form-item>

        <el-form-item label="部门状态">
          <el-radio v-model="form.sex"  label="男">正常</el-radio>
          <el-radio v-model="form.sex"  label="女">停用</el-radio>
        </el-form-item>
        <el-form-item label="备注" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入备注"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="submit1">确 定</el-button>
      </div>
    </el-dialog>

    <!--修改用户按钮弹框：2-->
    <el-dialog title="修改部门" :visible.sync="dialogFormVisible2" width="30%">
      <!--ruleForm2用于 修改弹框的表单验证，规则绑定的是 rules-->
      <el-form  :model="form" ref="ruleForm2" :rules="rules" label-width="100px"  style="width: 85%">
        <!--        <el-form-item label="昵称" prop="username">-->
        <!--          <el-input v-model="form.username" placeholder="请输入昵称" ></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="上级部门" prop="dept_name">
          <el-input v-model="form.ancestors" placeholder="请输入上级部门"></el-input>
        </el-form-item>
        <el-form-item label="部门名称" prop="dept_name">
          <el-input v-model="form.dept_name" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="order_num">
          <el-input v-model="form.order_num" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="leader_id">
          <el-input v-model="form.leader_id" placeholder="请输入负责人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="leader_id">
          <el-input v-model="form.leader_id" placeholder="请输入负责人"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="leader_id">
          <el-input v-model="form.leader_id" placeholder="请输入负责人"></el-input>
        </el-form-item>
        <el-form-item label="部门状态" prop="sex">
          <el-radio v-model="form.sex"  label="男">正常</el-radio>
          <el-radio v-model="form.sex"  label="女">停用</el-radio>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="submit2">确 定</el-button>
      </div>
    </el-dialog>




  </div>
</template>

<script>


export default {
  name: 'Dept',
  data() {
    //自定义表单验证方法：检查age
    const checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('年龄不能为空'));
      }
      if (!/^[0-9]+$/.test(value)) {//正则表达式
        callback(new Error('请输入数字值'));
      }
      if (parseInt(value) > 120 || parseInt(value) <= 0) {
        callback(new Error('请输入合理的年龄'));
      }
      callback()
    };
    //自定义表单验证方法：检查phone
    const checkPhone = (rule, value, callback) => {
      if (!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(value)) {//正则表达式
        callback(new Error('请输入合法的手机号'));
      }
      callback()
    };
    //自定义表单验证方法：检查nums
    const checkNums = (rule, value, callback) => {
      value = parseInt(value)
      if (value < 10 || value > 200) {
        callback(new Error('请输入大于等于10小于或等于200的整数'));
      }
      callback()
    };
    return {
      tableData: [//页面数据显示

        {
          dept_name: '若依科技',
          dept_status: '1',
          order_num: '0',
          create_time:'2023-07-03 20:47:47',
          update_time:'2023-07-03 20:47:47',
        }, {
          dept_name: '若依科技',
          dept_status: '1',
          order_num: '0',
          create_time:'2023-07-03 20:47:47',
          update_time:'2023-07-03 20:47:47',
        }, {
          dept_name: '若依科技',
          dept_status: '1',
          order_num: '0',
          create_time:'2023-07-03 20:47:47',
          update_time:'2023-07-03 20:47:47',
        }, {
          dept_name: '若依科技',
          dept_status: '1',
          order_num: '0',
          create_time:'2023-07-03 20:47:47',
          update_time:'2023-07-03 20:47:47',
        }


      ],
      total: 0,
      params: {
        //分页
        pageNum: 1,
        pageSize: 10,
        name: '',
        phone: ''
      },
      //1是添加用户弹框，2是修改用户按钮弹框，3是充值弹框,4是借书
      dialogFormVisible1: false,
      dialogFormVisible2: false,
      dialogFormVisible3: false,
      form: {},
      rules: {//表单验证规则，下面的规则 与form表单中的 prop 的值绑定
        score: [
          { required: true, message: '请输入积分', trigger: 'blur'},
          { validator: checkNums, trigger: 'blur'}
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur'}
        ],
        age: [
          { validator: checkAge, trigger: 'blur' }
        ],
        phone: [
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  created() {//在页面加载时就调用 分页查询的方法
    this.load()
  },
  methods: {
    //修改用户状态 的开关 方法
    changeStatus(row) {//直接将 row的所有内容传输过去，因为我们只修改了一个状态，其他都没变，所以还是可以调用用户修改的借口
      // request.put('/user/update', row).then(res => {
      //   if (res.code === '200') {//如果后端传来 200 则表示成功
      //     this.$notify.success('操作成功')
      //     this.load()
      //   } else {
      //     this.$notify.error(res.msg)
      //   }
      // })
    },
    //分页查询方法
    load() {

      // fetch('http://localhost:9090/user/list').then(res => res.json()).then(res => {
      //   console.log(res)
      //   this.tableData = res
      // })


      // request.get('/user/page', {
      //   params: this.params//params：传过去的参数
      // }).then(res => {
      //   if (res.code === '200') {//如果后端传来 200 则表示成功
      //     this.tableData = res.data.list
      //     this.total = res.data.total
      //   }
      // })
    },
    //重置搜索按钮 的方法
    reset() {//将name 和 phone 内容清空，重新加载页面
      this.params = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        phone: ''
      }
      this.load()
    },
    //添加用户按钮 的方法
    add() {
      this.dialogFormVisible1 = true//让添加弹框显示
      this.form = {sex: '男',account: '0'}//清空form中存储的用于修改按钮回显的数据，防止添加新用户时出现修改时回显的数据
      // 让account 默认为0，添加的用户账户就是0积分
    },
    //修改用户按钮 的方法
    updateUser(row){//row就是表格那一行的数据，用row做到数据回显
      this.dialogFormVisible2 = true
      this.form = row
    },
    //删除用户按钮 的方法
    del(id) {
      // request.delete("/user/delete/" + id).then(res => {
      //   if (res.code === '200') {//如果后端数据 发来200 表明成功
      //     this.$notify.success('删除成功')
      //     this.load()
      //   } else {
      //     this.$notify.error(res.msg)
      //   }
      // })
    },
    //充值按钮 的方法
    handleAccountAdd(row) {
      if (row.status == 0){//如果status是0，则表示不可用
        this.$notify.error('该用户不可使用')
      }else {
        this.form = JSON.parse(JSON.stringify(row))
        this.dialogFormVisible3 = true//让弹框3显示
      }
    },

    //添加用户 确认提交的方法
    submit1() {
      //ruleForm1：添加弹框的表单验证
      // this.$refs['ruleForm1'].validate((valid) => {
      //   if (valid) {//表单验证通过才能执行下面
      //     request.post('/user/save', this.form).then(res => {
      //       if (res.code === '200') {//如果后端数据 发来200 表明成功
      //         this.$notify.success('新增成功')
      //         this.$refs['ruleForm1'].resetFields()
      //         this.dialogFormVisible1 = false
      //         this.load()
      //       } else {
      //         this.$notify.error(res.msg)
      //       }
      //     })
      //   }
      // })
    },
    //修改用户 确认提交的方法
    submit2() {
      //ruleForm2：修改弹框的表单验证
      // this.$refs['ruleForm2'].validate((valid) => {
      //   if (valid) {//表单验证通过才能执行下面
      //     request.put('/user/update', this.form).then(res => {
      //       if (res.code === '200') {//如果后端数据 发来200 表明成功
      //         this.$notify.success('更新成功')//提示信息
      //         this.$refs['ruleForm2'].resetFields()
      //         this.dialogFormVisible2 = false//让弹框消失
      //         this.load()//重新加载页面
      //       } else {
      //         this.$notify.error(res.msg)
      //       }
      //     })
      //   }
      // })
    },



    handleCurrentChange(pageNum) {
      // 点击分页按钮触发分页
      this.params.pageNum = pageNum
      this.load()
    },


  }
}
</script>

<style scoped>

</style>