<script setup lang="ts">
import { ref } from "vue";

import { ViewComponentProps } from "@/store/types";
import { ButtonCore, InputCore } from "@/domains/ui";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";

const { app, view, history, client } = defineProps<ViewComponentProps>();

class PageLogic {
  $username: InputCore<string>;
  $password: InputCore<string>;
  $login: ButtonCore;

  constructor(props: Pick<ViewComponentProps, "app" | "client" | "history">) {
    const { app, client, history } = props;

    this.$username = new InputCore({
      defaultValue: "",
      placeholder: "请输入邮箱",
    });
    this.$password = new InputCore({
      defaultValue: "",
      placeholder: "请输入密码",
      type: "password",
      autoComplete: true,
    });
    this.$login = new ButtonCore({
      onClick: async () => {
        const values = {
          email: this.$username.value,
          pwd: this.$password.value,
        };
        this.$login.setLoading(true);
        const r = await app.$user.login(values);
        this.$login.setLoading(false);
        if (r.error) {
          app.tip({
            text: ["登录失败", r.error.message],
          });
          return;
        }
        app.tip({
          text: ["登录成功"],
        });
        history.replace("root.home_layout.home_index", {});
      },
    });
  }
}

const $logic = ref(new PageLogic({ app, client, history }));
</script>

<template>
  <div class="w-full h-screen">
    <div class="w-[640px] mx-auto mt-12">
      <div className="relative">
        <div className="z-20 relative text-3xl">FunFlixFilm</div>
        <div className="z-10 absolute bottom-[0px] left-[12px] w-[124px] h-[12px] bg-w-brand rounded-md"></div>
      </div>
      <div className="mt-4 py-4 space-y-4 rounded-md">
        <div>
          <div>邮箱</div>
          <Input class="mt-1 bg-w-bg-0" :store="$logic.$username" />
        </div>
        <div>
          <div>密码</div>
          <Input class="mt-1 bg-w-bg-0" :store="$logic.$password" />
        </div>
      </div>
      <div className="w-full mt-4">
        <Button variant="" size="" class="" :store="$logic.$login">登录</Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
