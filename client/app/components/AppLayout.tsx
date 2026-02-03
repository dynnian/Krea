import { Layout, Grid } from "antd";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider
          width={240}
          breakpoint="md"
          collapsedWidth={0}
          className="bg-white"
        >
          Sidebar
        </Sider>
      )}

      <Layout>
        <Header className="bg-white px-4 shadow-sm">
          Header
        </Header>

        <Content className="p-4 max-w-7xl mx-auto w-full">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
