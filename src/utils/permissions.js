// src/utils/permissions.js

export const PERMISSIONS = {
    DELETE: 1,  // 0001
    EDIT:   2,  // 0010
    VIEW:   4,  // 0100
    CREATE: 8   // 1000
  }

  export function hasPermission(operations, permission) {
    const ops = parseInt(operations)
    return (ops & permission) === permission
  }
  

  export function listPermissions(operations) {
    const ops = parseInt(operations)
    const active = []
  
    if (ops & PERMISSIONS.VIEW) active.push('VIEW')
    if (ops & PERMISSIONS.EDIT) active.push('EDIT')
    if (ops & PERMISSIONS.CREATE) active.push('CREATE')
    if (ops & PERMISSIONS.DELETE) active.push('DELETE')
  
    return active
  }
  
  export function toBinary(operations) {
    const ops = parseInt(operations)
    return ops.toString(2).padStart(4, '0') // Ej: '1101'
  }
  