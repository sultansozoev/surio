import React from 'react';
import ContentCard from '../content/ContentCard';
import ScrollableRow from '../common/ScrollableRow';

const ContentRow = ({ title, items, onFavoriteChange }) => {
    return (
        <ScrollableRow title={title} items={items}>
            {items.map((item) => {
                const itemKey = item.movie_id || item.serie_tv_id || item.id;

                return (
                    <div
                        key={itemKey}
                        className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56"
                        style={{ userSelect: 'none' }}
                    >
                        <ContentCard
                            content={item}
                            onFavoriteChange={onFavoriteChange}
                        />
                    </div>
                );
            })}
        </ScrollableRow>
    );
};

export default ContentRow;