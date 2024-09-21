<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1 class="mt-3">Add/Edit Tags</h1>
            </div>
            <hr>
            <form-tag  v-if="ready" @tagEditEvent="submitHandler" name="tagFrom" event="tagEditEvent">
    
                    <text-input
                        v-model="tag.name"
                        type="text"
                        required="true"
                        label="Name"
                        :value="tag.name"
                        name="name"></text-input>
    
                    <text-input
                    v-model="tag.description"
                    type="text"
                    required="true"
                    label="Description"
                    :value="tag.description"
                    name="description"></text-input>

                    <hr>
                    <div class="float-start">
                        <input type="submit" class="btn btn-primary me-2" value="Save" />
                        <router-link to="/admin/dashboard/tags" class="btn btn-outline-secondary">Cancel</router-link>
                    </div>
                    <div class="float-end">
                        <a v-if="tag.id > 0" class="btn btn-danger" href="javascript:void(0);" @click="confirmDelete(tag.id)">Delete</a>
                    </div>
                    <div class="clearfix"></div>

                </form-tag>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onBeforeMount} from 'vue'
import Security from './security.js'
import FormTag from '@/components/forms/FormTag.vue'
import TextInput from '@/components/forms/TextInput.vue'
import { useRoute } from 'vue-router';
import router from '../router/index.js'
import notie from 'notie'


export default {
    name: 'AppTagsAddEdit',
    props: {},
    emits: ['error'],
    components: {
    'form-tag': FormTag,
    'text-input': TextInput,
    },
    

    setup(props, cxt) {
        let ready = ref(false);
        let tag = ref({
            id: 0,
            name: "",
            description: "",
            created_at: null,
            updated_at: null
        });
        const route = useRoute();

        function submitHandler(){
            const payload = {
                id: tag.value.id,
                name: tag.value.name,
                description: tag.value.description,
            }
        
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/tags`, Security.requestOptions(payload, "PUT"))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    cxt.emit('success', 'Tag saved!')
                    router.push("/admin/dashboard/tags")
                }
            }).catch((error) => {
                cxt.emit('error', error)
            })
        }

        function confirmDelete(id){
            notie.confirm({
                text: "Are you sure you want to delete this book?",
                submitText: "Delete",
                submitCallback: () => {
                    let payload = {
                        id: id,
                    }

                    
                    fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/tags`, Security.requestOptions(payload, "DELETE"))
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            cxt.emit('error', data.message)
                        } else {
                            cxt.emit('success', 'Tag deleted!')
                            router.push("/admin/dashboard/tags")
                        }
                    }).catch((error) => {
                        cxt.emit('error', error)
            })
                }
            })
        }

        onBeforeMount(() => {
            Security.requireToken();
            if(route.params.tagId > 0) {
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/tags/${route.params.tagId}`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    tag.value = data.data;
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Tag of id ${route.params.tagId} can't be obtained form backend.`)
            })
        } 
        ready.value = true
        });
 
        return {
            tag,
            submitHandler,
            confirmDelete,
            ready
        }
    }
}
</script>
