import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getBoardBySlug } from "@/lib/actions/board-actions";
import { WORKSPACE_LISTS } from "@/lib/constants/config";

interface BoardPageProps {
    params: Promise<{
        slug: string
    }>
}


const BoardPage = async ({ params }: BoardPageProps) => {
    const { slug } = await params

    const session = await auth()
    if (!session?.user?.id) {
        redirect('/auth/sign-in')
    }

    const board = await getBoardBySlug(session.user.id, slug)
    if (!board) {
        notFound()
    }

// 1. Fetch board + lists + cards
// 2. Display workspace layout
// 3. Prepare za drag & drop
  return (
      <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-x-auto items-center justify-between bg-background">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-full px-2 py-1">
                  {WORKSPACE_LISTS.map(template => {
                      const list = board.lists.find(l => l.type === template.id)
                      return (
                          <div key={template.id}
                               className="rounded-xs shadow-sm bg-popover">
                              {/* List Header */}
                              <div className="p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2 justify-center">
                                      <div className={`w-2 h-2 rounded-full ${template.color}`}/>
                                      <h3 className="text-sm font-medium text-card-foreground">{template.title}</h3>
                                      <span className="text-sm text-muted-foreground">{list?.cards?.length || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      {/* Collapse + Add buttons */}
                                  </div>
                              </div>

                              {/* List Body */}
                              <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                                  {list?.cards?.map(card => (
                                      <div key={card.id}
                                           className="border rounded-sm p-3 shadow-sm hover:shadow-md transition-shadow bg-card hover:bg-muted">
                                          <div className="flex items-center gap-1">
                                              <div className={`w-2 h-2 rounded-full ${template.color}`}/>
                                              <h4 className="font-medium text-sm">{card.title}</h4>
                                          </div>

                                          {card.content && (
                                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{card.content}</p>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>
  );
};

export default BoardPage;
