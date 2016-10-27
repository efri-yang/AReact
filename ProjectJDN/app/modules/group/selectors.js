import { createSelector } from 'reselect'

//export const gInfoSelector = state => initGInfo(state)
export const gMembersSelector = state => state.groupMembers
//export const gFilesSelector = state => initGFiles(state)
export const gUploadFilesSelector = state => state.gUploadFiles

export const gInfoSelector = createSelector(
  state => state.groupInfo,
  state => state.groupName,
  state => state.groupMembers,
  (groupInfo, groupName, groupMembers) => {
    const { gname } = groupName
    if (gname) {
      groupInfo.gname = gname
    }
    if (groupMembers.members.length > 0) {
      groupInfo.member_num = groupMembers.members.length
    }
    return groupInfo
  }
)

export const gFilesSelector = createSelector(state => state.groupFiles, state => state.delFile,
  (groupFiles, delFile) => {
    const { files, otherFiles } = groupFiles
    if (!files && !otherFiles) {
      return {items: null}
    }
    let items = files.data && files.data.items ? files.data.items : []
    if (otherFiles.data) {
      for (let i = 0; i < otherFiles.data.length; i++) {
        items = items.concat(otherFiles.data[i])
      }
    }
    items.sort(sortFiled)
    const delId = delFile.dentry_id
    let index = -1
    for (let m = 0; m < items.length; m++) {
      if (delId && delId === items[m].dentry_id) {
        index = m
      }
    }
    if (index > -1) {
      items.splice(index, 1)
    }
    return {items: items}
  }
)

const sortFiled = (a, b) => {
  return b.create_at - a.create_at
}
