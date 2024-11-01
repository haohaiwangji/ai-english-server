const nextConfig = {
    async headers() {
        return [
            {
                source: "/api/:slug",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*", // 设置你的来源
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, DELETE, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization",
                    },
                ],
            },
        ];
    },
    // 添加其他 Next.js 配置
};
