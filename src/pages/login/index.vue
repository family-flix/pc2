<script setup lang="ts">
import { onMounted, ref } from "vue";

import { ViewComponentProps } from "@/store/types";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { QRCodeWithState } from "@/biz/qrcode_confirm/index";
import { createQRCode } from "@/domains/qrcode/index";
import { ButtonCore, InputCore } from "@/domains/ui/index";
import { AuthCodeStep } from "@/constants/index";

const props = defineProps<ViewComponentProps>();
const { history } = props;

function Page(props: ViewComponentProps) {
  const { app, view, history, client } = props;

  const $username = new InputCore({
    defaultValue: "",
    placeholder: "请输入邮箱",
  });
  const $password = new InputCore({
    defaultValue: "",
    placeholder: "请输入密码",
    type: "password",
    autoComplete: true,
  });
  const $login = new ButtonCore({
    async onClick() {
      const values = {
        email: $username.value,
        pwd: $password.value,
      };
      $login.setLoading(true);
      const r = await app.$user.loginWithEmailAndPwd(values);
      $login.setLoading(false);
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
  const $code = QRCodeWithState({ unique_id: view.query.code, step: AuthCodeStep.Loading, client });
  $code.onConfirm((v) => {
    const r2 = app.$user.authWithToken(v);
    if (r2.error) {
      app.tip({
        text: ["登录失败", r2.error.message],
      });
      return;
    }
    app.tip({
      text: ["登录成功"],
    });
    history.replace("root.home_layout.home_index", {});
  });

  return {
    $code,
    ui: {
      $username,
      $password,
      $login,
    },
  };
}

const $page = Page(props);
const qrcodeRef = ref<HTMLCanvasElement>();
const qrcode = ref($page.$code.state);
function refreshQRCode() {
  $page.$code.refresh();
}

$page.$code.onStateChange((v) => {
  console.log("$page.$code.onStateChange", v, $page.$code.state);
  qrcode.value = v;
});

onMounted(async () => {
  const $canvas = qrcodeRef.value;
  if (!$canvas) {
    return;
  }
  const ctx = $canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const r = await $page.$code.refresh();
  if (r.error) {
    props.app.tip({
      text: [r.error.message],
    });
    return;
  }
  $page.$code.startCheck();
  const hostname = (() => {
    if (props.app.env.prod === "develop") {
      return "https://media-t.funzm.com";
    }
    return history.$router.origin;
  })();
  createQRCode(`${hostname}/mobile/scan?code=${r.data.id}`, { width: 198, height: 198, ctx });
});
</script>

<template>
  <div class="w-full h-screen">
    <div class="w-[920px] mx-auto pt-12">
      <div class="relative w-[136px] cursor-pointer">
        <div class="z-10 absolute left-2 top-[36px] w-[280px] h-[32px] rounded-2xl bg-green-500"></div>
        <div class="z-20 relative text-6xl italic">FamilyFlix</div>
      </div>
      <div class="flex mt-8 min-h-[480px] border rounded-xl shadow-xl">
        <div class="flex items-center justify-center w-[360px]">
          <div class="qrcode relative inline-block p-2 border">
            <canvas ref="qrcodeRef" class="z-10 relative" width="198" height="198"></canvas>
            <template v-if="qrcode.step === AuthCodeStep.Loading">
              <div class="z-20 absolute inset-0">
                <div class="z-10 absolute inset-0 bg-white opacity-80"></div>
                <div class="z-20 absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center">加载中</div>
                </div>
              </div>
            </template>
            <template v-if="qrcode.step === AuthCodeStep.Scanned">
              <div class="z-20 absolute inset-0">
                <div class="z-10 absolute inset-0 bg-white opacity-80"></div>
                <div class="z-20 absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-lg">请确认登录</div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="qrcode.step === AuthCodeStep.Confirmed">
              <div class="z-20 absolute inset-0">
                <div class="z-10 absolute inset-0 bg-white opacity-80"></div>
                <div class="z-20 absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-lg">已确认</div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="qrcode.step === AuthCodeStep.Expired">
              <div class="z-20 absolute inset-0" @click="refreshQRCode">
                <div class="z-10 absolute inset-0 bg-white opacity-80"></div>
                <div class="z-20 absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-lg">二维码失效</div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="qrcode.step === AuthCodeStep.Error">
              <div class="z-20 absolute inset-0" @click="refreshQRCode">
                <div class="z-10 absolute inset-0 bg-white opacity-80"></div>
                <div class="z-20 absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-lg">发生错误</div>
                    <div class="mt-1 text-center">{{ qrcode.error?.message }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <!-- <div>使用微信扫码登录</div> -->
        </div>
        <div class="flex-1 flex items-center justify-center">
          <div class="w-[320px]">
            <div className="space-y-4 rounded-md">
              <div>
                <div>邮箱</div>
                <Input class="mt-1 bg-w-bg-0" :store="$page.ui.$username" />
              </div>
              <div>
                <div>密码</div>
                <Input class="mt-1 bg-w-bg-0" :store="$page.ui.$password" />
              </div>
            </div>
            <div className="w-full mt-8">
              <Button variant="" size="lg" class="w-full" :store="$page.ui.$login">登录</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
@/biz/qrcode_confirm/index
