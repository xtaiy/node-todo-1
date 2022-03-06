const db=require('./db.js')
const inquirer=require('inquirer')

module.exports.add=async (title)=>{
    //读取之前的任务
    const list=await db.read()
    //往里面添加一个title任务
    list.push({title,done:false})
    //存储任务到文件
    await db.write(list)
}
module.exports.clear=async ()=>{
    await db.write([])
}
function markAsDone(list,index){
    list[index].done=true
    db.write(list)
}
function markUnDone(list,index){
    list[index].done=false
    db.write(list)
}
function updateTitle(list,index){
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: "新的标题",
        default:list[index].title//旧的标题就存在这里
    }).then((answer3) => {
        list[index].title=answer3.title
        db.write(list)
    });
}
function remove(list,index){
    list.splice(index,1)
    db.write(list)
}
function askForAction(list,index){
    const actions={markAsDone,markUnDone,updateTitle,remove}
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: '请选择操作',
        choices: [
            {name:'退出',value:'quit'},
            {name:'已完成',value: 'markAsDone'},
            {name:'未完成',value: 'markUnDone'},
            {name:'改标题',value: 'updateTitle'},
            {name:'删除',value: 'remove'}
        ]
    }).then(answer2=>{
        const action=actions[answer2.action]
        action && action(list,index)
    })
}
function askForCreateTasks(list){
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: "输入任务"
    }).then((answer4) => {
        list.push({
            title:answer4.title,
            done:false
        })
        db.write(list)
    });
}

function printTasks(list){
    inquirer.prompt({
        type: 'list',
        name: 'index',
        message: '请选择你想操作的任务',
        choices: [{name:'退出',value:'-1'}, ...list.map((task,index)=>{
            return {name:`${task.done?'[x]':'[_]'} ${index+1} - ${task.title}`,value:(index).toString()}
        }),{name:'+ 创建任务',value:'-2'}]
    })
        .then((answer) => {
            const index=parseInt(answer.index)
            if(index>=0){
                //选择了一个任务
                askForAction(list,index)
            }else if(index=== -2){
                //创建任务
                askForCreateTasks(list)
            }
        });
}

module.exports.showAll=async ()=>{
    //读取之前的任务
    const list=await db.read()
    //打印之前的任务
    //printTasks
    printTasks(list)
}