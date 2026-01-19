import modService from '../../services/ModService'


export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    if(!files || files.length === 0){
        return {
            success: false,
            message: 'No file uploaded'
        }
    }
    const file = files[0]
    if(!file.filename){
        return {
            success: false,
            message: 'No filename provided'
        }
    }
    modService.writeFileInModDirectory(file.data, file.filename)
    
    
    // modService.writeFileInModDirectory()
    
    return {
        success: true
        
    }
})